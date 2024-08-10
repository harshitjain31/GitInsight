import requests
import os
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceInstructEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.vectorstores import FAISS
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

groq_llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

openai_llm = ChatOpenAI(model_name="gpt-3.5-turbo")

class Embedder:
    def __init__(self, git_link) -> None:
        self.git_link = git_link
        self.repo_name = '/'.join(self.git_link.split('/')[-2:])
        self.repo_name = self.repo_name.replace('.git', '')
        self.openai = OpenAIEmbeddings()
        self.instruct = HuggingFaceInstructEmbeddings(model_name='hkunlp/instructor-xl')
        self.allowed_extensions = ['.py', '.ipynb', '.md']

    def fetch_files(self, path=''):
        url = f"https://api.github.com/repos/{self.repo_name}/contents/{path}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def extract_all_files(self):
        self.docs = []
        def process_directory(path=''):
            files = self.fetch_files(path)
            for file in files:
                if file['type'] == 'file':
                    file_extension = os.path.splitext(file['name'])[1]
                    if file_extension in self.allowed_extensions:
                        try:
                            file_content = requests.get(file['download_url']).text
                            self.docs.extend(file_content)
                        except Exception as e:
                            pass
                elif file['type'] == 'dir':
                    process_directory(file['path'])

        process_directory()

    def chunk_code(self):
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        self.texts = text_splitter.split_text(' '.join(self.docs))
        self.num_texts = len(self.texts)

    def get_vectorstore(self):
        embeddings = self.instruct
        self.vectorstore = FAISS.from_texts(texts=self.texts, embedding=embeddings)

    def load_db(self):
        self.extract_all_files()
        self.chunk_code()
        self.get_vectorstore()
        self.db = self.vectorstore
        self.retriever = self.db.as_retriever()
        self.retriever.search_kwargs['distance_metric'] = 'cos'
        self.retriever.search_kwargs['fetch_k'] = 100
        self.retriever.search_kwargs['k'] = 3

    def retrieve_results(self, query):
        memory = ConversationBufferMemory(memory_key='chat_history',return_messages=True)
        qa = ConversationalRetrievalChain.from_llm(
            llm = self.model, chain_type="stuff", retriever=self.retriever,
            memory=memory,
            condense_question_llm=self.model
        )
        result = qa({"question": query})
        return result['answer']
