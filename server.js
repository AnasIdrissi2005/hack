from flask import Flask, request, jsonify, send_from_directory
import os
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# تأكد من وجود مجلد uploads
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# أنواع الملفات المسموح بها
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# مسار الصفحة الرئيسية
@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>خادم تحميل الصور</title>
    </head>
    <body>
        <h1>مرحبًا! هذا خادم تحميل الصور.</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept="image/*" required>
            <input type="submit" value="تحميل الصورة">
        </form>
    </body>
    </html>
    """

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "لم تُرفع أي صورة"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "لم يتم اختيار ملف"}), 400
    
    if file and allowed_file(file.filename):
        # تسمية الملف باستخدام الطابع الزمني
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({
            "message": "تم رفع الصورة بنجاح!",
            "url": f"/uploads/{filename}"
        })
    else:
        return jsonify({"error": "الملف ليس صورة أو نوع الملف غير مدعوم!"}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)