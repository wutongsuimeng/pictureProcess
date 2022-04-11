import base64
import json

import cv2.cv2 as cv2
import numpy as np
from django.http import HttpResponse

from PtPro import user_setting
from PtPro.views import get_file_path, action_record


# 图像平滑-均值滤波
def smooth_blur(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    ksize = int(req['ksize'])  # 滤波窗口尺寸，要是奇数，3，5，7等
    img_blur = cv2.blur(img, (ksize, ksize))
    img_path = action_record("smooth_blur", img_blur)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像平滑-高斯滤波
def smooth_gaussian_blur(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    ksize = int(req['ksize'])  # 滤波窗口尺寸,要是奇数
    sigmax = int(req['sigmax'])  # 标准差，当是0时，函数会自己算
    img_gaussian_blur = cv2.GaussianBlur(img, (ksize, ksize), sigmax)
    img_path = action_record("smooth_gaussian_blur", img_gaussian_blur)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像平滑-中值滤波
def smooth_median_blur(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    ksize = int(req['ksize'])  # 滤波窗口尺寸,要是奇数
    img_median_blur = cv2.medianBlur(img, ksize)
    img_path = action_record("smooth_median_blur", img_median_blur)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 图像平滑-双边滤波
def smooth_bilateral_filter(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    d = int(req['d'])  # 邻域直径
    sigma_color = int(req['sigma_color'])  # 灰度值相似性高斯函数标准差
    sigma_space = int(req['sima_space'])  # 空间高斯函数标准差
    img_bilateral_filter = cv2.bilateralFilter(img, d, sigma_color, sigma_space)
    img_path = action_record("smooth_bilateral_filter", img_bilateral_filter)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 增强对比度-线性变换
def contrast_linear(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    alpha = float(req['alpha'])  # 乘数因子
    beta = float(req['beta'])  # 偏移量
    img_linear = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    img_path = action_record("contrast_linear", img_linear)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 增强对比度-伽马变换
def contrast_gamma(request):
    img = cv2.imread(get_file_path(request))
    img_gamma = np.power(img / 255.0, 0.5) * 255.0
    img_gamma = img_gamma.astype(np.uint8)
    img_path = action_record("contrast_gamma", img_gamma)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 增强对比度-全局直方图均衡化
def contrast_equalize(request):
    img = cv2.imread(get_file_path(request))
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img_equalize = cv2.equalizeHist(img_gray)  # opencv里面equalizeHist()函数只能处理单通道数据
    img_path = action_record("contrast_equalize", img_equalize)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])


# 增强对比度-限制对比度自适应直方图均衡化
def contrast_clahe(request):
    img = cv2.imread(get_file_path(request))
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    clip_limit = int(req['clip_limit'])  # 限制对比度的阈值，默认为40，直方图中像素值出现次数大于该阈值，多余的次数会被重新分配
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    clahe = cv2.createCLAHE(clip_limit, (8, 8))
    img_clahe = clahe.apply(img_gray)
    img_path = action_record("contrast_clahe", img_clahe)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
