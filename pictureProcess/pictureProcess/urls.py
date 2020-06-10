"""pictureProcess URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.urls import path

from PtPro import views, picture_transform, picture_enhance, fast_neural_style, edge_sharpen

urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^$', views.index),
    url(r'^createFile/', views.createFile, name="createFile"),
    path('upload_file/', views.upload_file, name='upload'),
    url(r'^download/', views.file_download, name="download"),
    url(r'^edit/', views.edit, name="edit"),
    url(r'^threshold2/', picture_transform.threshold2, name="threshold2"),
    url(r'^adaptive_threshold/', picture_transform.adaptive_threshold, name="adaptive_threshold"),
    url(r'^threshold_otsu/', picture_transform.threshold_otsu, name="threshold_otsu"),
    url(r'^rgb_to_gray/', picture_transform.rgb_to_gray, name="rgb_to_gray"),
    url(r'^rotate/', picture_transform.rotate, name="rotate"),
    url(r'^cut_picture/', picture_transform.cut_picture, name="cut_picture"),
    url(r'^resize2/', picture_transform.resize2, name="resize2"),
    url(r'^contrast_linear/', picture_enhance.contrast_linear, name="contrast_linear"),
    url(r'^contrast_gamma/', picture_enhance.contrast_gamma, name="contrast_gamma"),
    url(r'^contrast_equalize/', picture_enhance.contrast_equalize, name="contrast_equalize"),
    url(r'^contrast_clahe/', picture_enhance.contrast_clahe, name="contrast_clahe"),
    url(r'^roberts/', edge_sharpen.roberts, name="roberts"),
    url(r'^prewitt/', edge_sharpen.prewitt, name="prewitt"),
    url(r'^sobel/', edge_sharpen.sobel, name="sobel"),
    url(r'^laplacian/', edge_sharpen.laplacian, name="laplacian"),
    url(r'^canny/', edge_sharpen.canny, name="canny"),
    url(r'^smooth_blur/', picture_enhance.smooth_blur, name="smooth_blur"),
    url(r'^smooth_gaussian_blur/', picture_enhance.smooth_gaussian_blur, name="smooth_gaussian_blur"),
    url(r'^smooth_median_blur/', picture_enhance.smooth_median_blur, name="smooth_median_blur"),
    url(r'^smooth_bilateral_filter/', picture_enhance.smooth_bilateral_filter, name="smooth_bilateral_filter"),
    url(r'^fast_neural_style/', fast_neural_style.style, name="style"),
    url(r'^undo/', views.undo, name="undo"),
    url(r'^redo/', views.redo, name="redo"),
    url(r'^get_current_picture/', picture_transform.get_current_picture, name="get_current_picture"),
]
