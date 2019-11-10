from flask import Flask, current_app
app = Flask(__name__)

@app.route('/index')
def hello_world():
    return current_app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='localhost',debug=True,port=4000)