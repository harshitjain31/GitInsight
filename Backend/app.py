from flask import Flask, request, jsonify
from flask_cors import CORS
import utils
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatOpenAI()

app = Flask(__name__)
CORS(app, support_credentials=True)

embedder = None

@app.route('/initialize_github',methods=['GET','POST'])
def initialize_github():
    global embedder

    data = request.get_json()
    url = data.get('repoUrl','')

    embedder = utils.Embedder(url)

    embedder.load_db()

    return jsonify({"message": "Your repo has been processed"}), 200

@app.route('/chat_with_repo',methods=['GET','POST'])
def chat_with_repo():
    global embedder

    data = request.get_json()
    query = data.get('query','')
    
    answer = embedder.retrieve_results(query)

    return jsonify({"answer": answer}), 200

if __name__ == '__main__':
    app.run(debug=False)