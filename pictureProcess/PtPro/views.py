import base64
import io
import json
import os
import random
import time

import cv2.cv2 as cv2
import numpy as np
from django.http import HttpResponse, FileResponse
from django.shortcuts import render

from PtPro import user_setting
from PtPro.models import ModelFormFile


# 创建函数处理上传文件数据

# 获取图片地址
def get_file_path(request):
    filename = user_setting.USER_ACTIONS[user_setting.ACTION_INDEX]["file_name"]  # 真正的
    # filename = user_setting.FILE_NAME  # 临时的
    files = user_setting.FILE_NAME.split(".")
    return 'frontend/static/images/' + user_setting.USER_NAME + '/' + files[0] + '/' + filename


# 文件上传
def upload_file(request):
    if request.method == 'POST':
        forms = ModelFormFile(request.POST, request.FILES)
        if forms.is_valid():
            forms.save(commit=True)  # 文件直接保存在model中的upload_to指定的子目录下
            return HttpResponse('ok')
    else:
        forms = ModelFormFile()
    # return render(request, '../frontend/index.html', {'forms': forms})
    return HttpResponse("false")


# 文件下载
def file_download(request):
    print(user_setting.USER_ACTIONS)
    file = open(get_file_path(request), 'rb')
    response = FileResponse(file)
    response['Content-Type'] = 'application/octet-stream'
    response['Content-Disposition'] = 'attachment;filename=' + user_setting.FILE_NAME
    return response


# 文件新建
def createFile(request):
    img_name = request.POST["fileName"]
    img_data = base64.b64decode(request.POST["file"].replace('data:image/png;base64,', ''))
    print(img_name)

    # 添加到配置文件
    # 以后用
    user_setting.USER_NAME = str(int(time.time())) + str(random.randint(0, 100))  # 用户名
    user_setting.USER_ACTIONS = [{'file_name': img_name, 'action_name': 'createFile'}]
    user_setting.ACTION_INDEX = 0
    user_setting.FILE_NAME = img_name

    # 保存到文件
    os.makedirs('frontend/static/images/' + user_setting.USER_NAME + '/' + img_name.split(".")[0])
    img_path = 'frontend/static/images/' + user_setting.USER_NAME + '/' + img_name.split(".")[0] + "/" + img_name
    print("createFile img_path:" + img_path)
    file = io.open(img_path, "wb")
    file.write(img_data)
    file.close()

    msg = {"msg": "ok"}
    return HttpResponse(json.dumps(msg))


# 操作记录,返回文件地址
def action_record(action_name, file):  # 操作名字,文件
    if user_setting.ACTION_INDEX < len(user_setting.USER_ACTIONS) - 1:  # 如果此次操作会覆盖操作
        user_setting.USER_ACTIONS = user_setting.USER_ACTIONS[:user_setting.ACTION_INDEX + 1]
    user_setting.ACTION_INDEX = user_setting.ACTION_INDEX + 1
    # 计算文件名字
    file_name = user_setting.FILE_NAME
    new_file_name = action_name + "_" + str(int(time.time())) + "_" + str(random.randint(0, 100)) + "." + \
                    file_name.split('.')[-1]

    user_setting.USER_ACTIONS.append({'action_name': action_name, 'file_name': new_file_name})
    # 保存新文件
    file_path = 'frontend/static/images/' + user_setting.USER_NAME + '/' + file_name.split(".")[
        0] + "/" + new_file_name
    print(file_path)
    cv2.imwrite(file_path, file)
    return file_path


# 撤销操作
def undo(request):
    print(user_setting.ACTION_INDEX)
    print(user_setting.USER_ACTIONS[user_setting.ACTION_INDEX])
    print(user_setting.USER_ACTIONS)
    if user_setting.ACTION_INDEX > 0:
        user_setting.ACTION_INDEX = user_setting.ACTION_INDEX - 1
        file_path = 'frontend/static/images/' + user_setting.USER_NAME + '/' + user_setting.FILE_NAME.split(".")[
            0] + "/" + user_setting.USER_ACTIONS[user_setting.ACTION_INDEX]["file_name"]
        print(file_path)
        img_data = open(file_path, "rb").read()
        return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
    else:
        print("不能撤销了")
        error_data = {"error": "不能撤销了"}
        return HttpResponse(json.dumps(error_data))


# 重做
def redo(request):
    if user_setting.ACTION_INDEX < len(user_setting.USER_ACTIONS) - 1:  # 如果还有下一步
        user_setting.ACTION_INDEX = user_setting.ACTION_INDEX + 1
        file_path = 'frontend/static/images/' + user_setting.USER_NAME + '/' + user_setting.FILE_NAME.split(".")[
            0] + "/" + user_setting.USER_ACTIONS[user_setting.ACTION_INDEX]["file_name"]
        print("redo的filename为：" + file_path)
        img_data = open(file_path, "rb").read()
        return HttpResponse(base64.b64encode(img_data), content_type="image/" + user_setting.FILE_NAME.split(".")[1])
    else:
        print("没有下一步了")
        error_data = {"error": "没有下一步了"}
        return HttpResponse(json.dumps(error_data))


# 接受编辑的文件
def edit(request):
    # print(request.body)
    # print(request.POST["file"])
    img_encode = request.POST["file"].replace('data:image/png;base64,', '')
    img_data = base64.b64decode(img_encode)
    im1 = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
    # i=cv2.imread(BytesIO(img_data))
    # i = Image.open(BytesIO(img))
    # i.show()
    # print(img)
    action_record("edit", im1)
    msg = {"msg": "ok"}
    return HttpResponse(json.dumps(msg))


# 默认页面
def index(request):
    return render(request, '../frontend/index.html')
