import base64
import json

import cv2.cv2 as cv2
import numpy as np
from django.http import HttpResponse

from PtPro import user_setting
from PtPro.views import get_file_path, action_record


# 图像锐化与边缘检测-Roberts算子
def roberts(request):
    img = cv2.imread(get_file_path(request))
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    # Roberts算子
    kernel_x = np.array([[-1, 0], [0, 1]], dtype=int)
    kernel_y = np.array([[0, -1], [1, 0]], dtype=int)
    x = cv2.filter2D(img_gray, cv2.CV_16S, kernel_x)
    y = cv2.filter2D(img_gray, cv2.CV_16S, kernel_y)
    # 转uint8
    abs_x = cv2.convertScaleAbs(x)
    abs_y = cv2.convertScaleAbs(y)
    img_roberts = cv2.addWeighted(abs_x, 0.5, abs_y, 0.5, 0)
    img_path = action_record("roberts", img_roberts * 255)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像锐化与边缘检测-Prewitt算子
def prewitt(request):
    img = cv2.imread(get_file_path(request))
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    # Prewitt算子
    kernel_x = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], dtype=int)
    kernel_y = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=int)
    x = cv2.filter2D(img_gray, cv2.CV_16S, kernel_x)
    y = cv2.filter2D(img_gray, cv2.CV_16S, kernel_y)
    # 转uint8
    abs_x = cv2.convertScaleAbs(x)
    abs_y = cv2.convertScaleAbs(y)
    img_prewitt = cv2.addWeighted(abs_x, 0.5, abs_y, 0.5, 0)
    img_path = action_record("prewitt", img_prewitt)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像锐化与边缘检测-Sobel算子
def sobel(request):
    img = cv2.imread(get_file_path(request))
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    # Sobel算子
    x = cv2.Sobel(img_gray, cv2.CV_16S, 1, 0)  # 对x求一阶导
    y = cv2.Sobel(img_gray, cv2.CV_16S, 0, 1)  # 对y求一阶导
    # 转uint8
    abs_x = cv2.convertScaleAbs(x)
    abs_y = cv2.convertScaleAbs(y)
    img_sobel = cv2.addWeighted(abs_x, 0.5, abs_y, 0.5, 0)
    img_path = action_record("sobel", img_sobel)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像锐化与边缘检测-Laplacian算子
def laplacian(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    ksize = int(req['ksize'])  # 用于计算二阶导数的滤波器的孔径大小，其值必须是正数和奇数，且默认值为1
    # Laplacian算子
    dst = cv2.Laplacian(img_gray, cv2.CV_16S, ksize=ksize)
    img_laplacian = cv2.convertScaleAbs(dst)
    img_path = action_record("laplacian", img_laplacian)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像锐化与边缘检测-Canny算子
def canny(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    min_val = int(req['minVal'])  # 低阈值
    max_val = int(req['maxVal'])  # 高阈值
    ksize = int(req["ksize"])  # 孔径大小
    img_canny = cv2.Canny(img_gray, min_val, max_val, ksize)
    img_path = action_record("canny", img_canny)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
