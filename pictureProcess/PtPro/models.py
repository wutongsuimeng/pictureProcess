from datetime import datetime
from django.db import models
from django.forms import ModelForm
import time, random
# Create your models here.
from PtPro import user_setting


def new_filename(instance, filename):
    print("文件名字是" + filename)
    files = filename.split(".")
    user_setting.FILE_NAME = filename  # 将文件名保存到user_setting中
    # 保存操作
    user_setting.ACTION_INDEX = 0
    user_setting.USER_ACTIONS = []
    user_setting.USER_NAME = str(int(time.time())) + str(random.randint(0, 100))  # 以后再用
    user_name = user_setting.USER_NAME
    user_setting.USER_ACTIONS.append({'action_name': "upload", 'file_name': filename})
    return '{user_name}/{files}/{filename}'.format(id=instance.id, user_name=user_name, filename=filename,
                                                   files=files[0])


class ModelFileField(models.Model):
    file = models.ImageField(upload_to=new_filename)


class ModelFormFile(ModelForm):
    class Meta:
        model = ModelFileField
        fields = "__all__"
