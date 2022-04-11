import base64
import json

import cv2
from django.http import HttpResponse

from PtPro import user_setting
from PtPro.views import get_file_path, action_record


def style(request):
    # 加载模型
    req = json.loads(str(request.body, 'utf-8'))  # 先将字节流转为str，再将str转为json
    model_path = "PtPro/models/"
    net = cv2.dnn.readNetFromTorch(model_path + req['model'] + ".t7")
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    # 读取图片
    image = cv2.imread(get_file_path(request))
    (h, w) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1.0, (w, h), (103.939, 116.779, 123.680), swapRB=False, crop=False)
    # 进行计算
    net.setInput(blob)
    out = net.forward()
    out = out.reshape(3, out.shape[2], out.shape[3])
    out[0] += 103.939
    out[1] += 116.779
    out[2] += 123.68
    out /= 255
    out = out.transpose(1, 2, 0)
    # 输出图片
    img_path = action_record("style", out * 255)
    img_data = open(img_path, "rb").read()
    return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
