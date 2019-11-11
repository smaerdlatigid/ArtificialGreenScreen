from flask import Flask, current_app
app = Flask(__name__)

@app.route('/webcam')
def webcam_demo():
    return current_app.send_static_file('camdemo.html')

@app.route('/slider')
def slider_demo():
    return current_app.send_static_file('sliderdemo.html')

if __name__ == '__main__':
    app.run(host='localhost',debug=True,port=4000)