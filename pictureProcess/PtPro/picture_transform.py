# 二值化处理

import base64
import json
import cv2
from django.http import HttpResponse

from PtPro import user_setting
from PtPro.views import get_file_path, action_record


# 简单阈值
def threshold2(request):
    img = cv2.imread(get_file_path(request), cv2.IMREAD_GRAYSCALE)
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    threshold_value = int(req['threshold_value'])  # 阈值
    threshold_type = int(req['threshold_type'])  # 阈值类型
    threshold_type2 = None
    if threshold_type == 0:
        threshold_type2 = cv2.THRESH_BINARY  # 黑白二值
    elif threshold_type == 1:
        threshold_type2 = cv2.THRESH_BINARY_INV  # 黑白二值反转
    elif threshold_type == 2:
        threshold_type2 = cv2.THRESH_TRUNC  # 图像多像素
    elif threshold_type == 3:
        threshold_type2 = cv2.THRESH_TOZERO  # 低于阈值置零
    elif threshold_type == 4:
        threshold_type2 = cv2.THRESH_TOZERO_INV  # 超过阈值置零
    else:
        threshold_type2 = cv2.THRESH_BINARY  # 默认为黑白二值
    ret, thresh1 = cv2.threshold(img, threshold_value, 255, threshold_type2)
    img_path = action_record("threshold2", thresh1)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 自适应阈值
# adaptive_method=0表示采用平均自适应方法，=1表示采用高斯
def adaptive_threshold(request):
    img = cv2.imread(get_file_path(request), 0)
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    adaptive_method = int(req['adaptive_method'])  # 自适应方法
    if adaptive_method == 0:
        ath = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
    else:
        ath = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    img_path = action_record("adaptive_threshold", ath)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# Otsu’s阈值
def threshold_otsu(request):
    img = cv2.imread(get_file_path(request), 0)
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    threshold_value = int(req['threshold_value'])  # 阈值
    ret, thresh1 = cv2.threshold(img, threshold_value, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    img_path = action_record("threshold_otsu", thresh1)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 灰度化
def rgb_to_gray(request):
    img = cv2.imread(get_file_path(request))
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img_path = action_record("rgb_to_gray", img_gray)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 旋转
def rotate(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    angle = float(req['angle'])  # 角度
    (h, w) = img.shape[:2]
    center = (w / 2, h / 2)
    rotate_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)  # 获取旋转矩阵
    img_rotate = cv2.warpAffine(img, rotate_matrix, (w, h))
    img_path = action_record("rotate", img_rotate)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 裁剪
def cut_picture(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))
    y0 = int(req['y0'])
    y1 = int(req['y1'])
    x0 = int(req['x0'])
    x1 = int(req['x1'])
    img_cut = img[y0:y1, x0:x1]  # 裁剪坐标为[y0:y1, x0:x1]
    img_path = action_record("cut_picture", img_cut)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 缩放，放大多少倍
def resize2(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    width = float(req["width"])
    height = float(req["height"])
    # 使用cv.resize对图像进行缩放
    img_resized = cv2.resize(img, (int(width), int(height)))
    img_path = action_record("resize2", img_resized)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 获取当前图片
def get_current_picture(request):
    file_path = 'frontend/static/images/' + user_setting.USER_NAME + '/' + user_setting.FILE_NAME.split(".")[
        0] + "/" + user_setting.USER_ACTIONS[user_setting.ACTION_INDEX]["file_name"]
    print("redo的filename为：" + file_path)
    img_data = open(file_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
