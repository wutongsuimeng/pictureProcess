new Vue({
    el: '#app',
    delimiters: ['${', '}'], //['','']里面加什么符号表示让它在冲突时保留vue
    data() {
        return {
            activeIndex: '1',
            activeIndex2: '1',
            //侧边栏生成数据
            formData: {
                formItemList: [],
            },
            imageExist: false,
            loading: false,
            isClear: false,
            canvas: "",
            context: "",
            drawAction: [],
            createFileDialogVisible: false,
            //文件信息
            fileData: {
                height: "",
                width: "",
                color: "",
                fileName: "",
            },

        };
    },
    created: function () {
        let canvas = document.getElementById("pictureCanvas");
        canvas.width = 0;
        canvas.height = 0;
    },
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        },
        //新建文件
        createFile() {
            this.createFileDialogVisible = false;
            this.canvas = document.getElementById("pictureCanvas");
            this.context = this.canvas.getContext('2d');
            this.canvas.width = this.fileData["width"];
            this.canvas.height = this.fileData["height"];
            this.context.fillStyle = this.fileData["color"];
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.imageExist = true;
            this.editCanvas("createFile");
        },
        handleAvatarSuccess(res, image) {
            //如果文件上传成功
            if (res === "ok") {
                this.canvasLoad(URL.createObjectURL(image.raw));
                this.imageExist = true;
            } else {
                alert("文件上传失败");
            }
        },
        saveImage() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            axios.get('/download',
                {
                    responseType: 'blob'
                })
                .then(res => {
                    if (res.status === 200) {
                        let url = window.URL.createObjectURL(new Blob([res.data]));
                        let link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.setAttribute('download', res.headers['content-disposition'].split('=').reverse()[0]);
                        document.body.appendChild(link);
                        link.click()
                    }
                })
        },
        undo() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/undo/");
        },
        redo() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/redo/");
        },
        editCanvas(action) {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            let clickToDoUrl;       //表示点击保存按钮后，动作到哪里去，编辑还是新建
            if (action === "edit") {     //如果动作是来自编辑按钮的
                clickToDoUrl = "save";
            } else {
                if (action === "createFile") {  //如果是来自新建的
                    clickToDoUrl = "createFile";
                }
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 0,
                        key: 'editRect',
                        label: "形状类型",
                        tagSelect: "edit", //表示是编辑的选择器
                        options: [
                            {
                                value: 0,
                                key: "pan",
                                label: "画笔",
                            },
                            {
                                value: 1,
                                key: "fillRect",
                                label: "填充矩形",
                            },
                            {
                                value: 2,
                                key: "strokeRect",
                                label: "边框矩形",
                            },
                            {
                                value: 3,
                                key: "arc",
                                label: "圆",
                            },
                            {
                                value: 4,
                                key: "fillArc",
                                label: "填充圆",
                            },
                        ]
                    },
                    {
                        type: 'colorPicker',
                        colorPick: "",
                        name: 0,
                        predefineColors: [
                            '#ffffff',
                        ],
                        label: "选择画笔颜色：",
                    },
                    {
                        type: 'slider',
                        name: 1,
                        value: 1,
                        min: 1,
                        max: 200,
                        spanText: "画笔宽度",
                        step: 1,
                        marks: {},
                    },
                    {
                        type: 'button',
                        text: "清屏",
                        clickToDo: "clear",
                    },
                    {
                        type: 'button',
                        text: "橡皮檫",
                        clickToDo: "eraser",
                    },
                    {
                        type: 'button',
                        text: "保存",
                        clickToDo: clickToDoUrl,
                    },
                ]
            };
            if (this.drawAction.length !== 0) {
                //移除存在的listener
                this.canvas.removeEventListener("mousedown", this.drawAction[0]);
                this.canvas.removeEventListener("mousemove", this.drawAction[1]);
                this.canvas.removeEventListener("mouseup", this.drawAction[2]);
            }
            this.canvas = document.getElementById("pictureCanvas");
            this.context = this.canvas.getContext('2d');
            let data = {
                "type": "pan",
            };
            this.drawAction = this.drawLine(data);
        },
        resize() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: this.fileData.width,
                        label: '宽度(px)',
                        key: 'width',
                    },
                    {
                        type: 'input',
                        name: this.fileData.height,
                        label: '高度(px)',
                        key: 'height',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/resize2/",
                    }
                ]
            };
        },
        cutPicture() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "0",
                        label: 'x0',
                        key: 'x0',
                    },
                    {
                        type: 'input',
                        name: "50",
                        label: 'x1',
                        key: 'x1',
                    },
                    {
                        type: 'input',
                        name: "0",
                        label: 'y0',
                        key: 'y0',
                    },
                    {
                        type: 'input',
                        name: "50",
                        label: 'y1',
                        key: 'y1',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/cut_picture/",
                    }
                ]
            };
            this.canvas = document.getElementById("pictureCanvas");
            this.context = this.canvas.getContext('2d');
            const that = this;
            let canvas = that.canvas;
            let context = that.context;
            let origin = [0, 0];
            let width2height = [0, 0];
            let ImageData;
            ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            //监听画板鼠标按下事件，开始绘画
            context.canvas.addEventListener("mousedown", startAction);
            //监听画板鼠标抬起事件，结束绘画
            context.canvas.addEventListener("mouseup", endAction);

            function startAction(event) {
                //监听鼠标移动
                let rect = canvas.getBoundingClientRect();   //获取canvas边界。因为context.lineTo的坐标是相对于canvas的，而event.pageX的坐标是相对于整个页面的，所以要减去canvas的边界
                origin = [event.pageX - rect.left, event.pageY - rect.top];
                context.putImageData(ImageData, 0, 0);
                context.canvas.addEventListener("mousemove", moveAction);
            }

            //鼠标抬起事件
            function endAction() {
                context.strokeRect(origin[0], origin[1], width2height[0], width2height[1]);
                console.log(origin);
                console.log(width2height);
                that.formData.formItemList[0]["name"] = origin[0];
                that.formData.formItemList[1]["name"] = width2height[0] + origin[0];
                that.formData.formItemList[2]["name"] = origin[1];
                that.formData.formItemList[3]["name"] = width2height[1] + origin[1];
                origin = [0, 0];
                width2height = [0, 0];
                context.canvas.removeEventListener("mousemove", moveAction);
            }

            function moveAction(event) {
                let rect = canvas.getBoundingClientRect();
                context.putImageData(ImageData, 0, 0);
                if (origin[0] !== 0 || origin[1] !== 0) {
                    width2height = [event.pageX - rect.left - origin[0], event.pageY - rect.top - origin[1]];
                    context.strokeRect(origin[0], origin[1], width2height[0], width2height[1]);
                }
            }

            that.drawAction = [startAction, moveAction, endAction]
        },
        rotate() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'slider',
                        key: 'angle',
                        name: 0,
                        value: 0,
                        min: -180,
                        max: 180,
                        spanText: "逆时针/顺时针(负数为逆时针，正数为顺时针)",
                        step: 90,
                        marks: {
                            "-180": "-180",
                            "-90": "-90",
                            "0": "0",
                            "90": "90",
                            "180": "180",
                        },
                    },
                    {
                        type: 'submit',
                        clickUrl: "/rotate/",
                    }
                ]
            };
        },
        rgbToGray() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/rgb_to_gray/");
        },
        threshold2() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "127",
                        label: '阈值',
                        key: 'threshold_value',
                    },
                    {
                        type: 'select',
                        name: 0,
                        key: 'threshold_type',
                        label: "阈值类型",
                        options: [
                            {
                                value: 0,
                                label: "黑白二值",
                            },
                            {
                                value: 1,
                                label: "黑白二值反转",
                            },
                            {
                                value: 2,
                                label: "图像多像素",
                            },
                            {
                                value: 3,
                                label: "低于阈值置零",
                            },
                            {
                                value: 4,
                                label: "超过阈值置零",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/threshold2/",
                    }
                ]
            };
        },
        adaptiveThreshold() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 0,
                        key: 'adaptive_method',
                        label: "自适应方法",
                        options: [
                            {
                                value: 0,
                                label: "均值",
                            },
                            {
                                value: 1,
                                label: "高斯",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/adaptive_threshold/",
                    }
                ]
            };
        },
        thresholdOtsu() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "127",
                        label: '阈值',
                        key: 'threshold_value',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/threshold_otsu/",
                    }
                ]
            };
        },
        smoothBlur() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 3,
                        key: 'ksize',
                        label: "模糊窗口尺寸",
                        options: [
                            {
                                value: 3,
                                label: "3x3",
                            },
                            {
                                value: 5,
                                label: "5x5",
                            },
                            {
                                value: 7,
                                label: "7x7",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/smooth_blur/",
                    }
                ]
            };
        },
        smoothGaussianBlur() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 3,
                        key: 'ksize',
                        label: "模糊窗口尺寸",
                        options: [
                            {
                                value: 3,
                                label: "3x3",
                            },
                            {
                                value: 5,
                                label: "5x5",
                            },
                            {
                                value: 7,
                                label: "7x7",
                            },
                        ]
                    },
                    {
                        type: 'input',
                        name: "0",
                        label: '标准差',
                        key: 'sigmax',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/smooth_gaussian_blur/",
                    }
                ]
            };
        },
        smoothMedianBlur() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 3,
                        key: 'ksize',
                        label: "模糊窗口尺寸",
                        options: [
                            {
                                value: 3,
                                label: "3x3",
                            },
                            {
                                value: 5,
                                label: "5x5",
                            },
                            {
                                value: 7,
                                label: "7x7",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/smooth_median_blur/",
                    }
                ]
            };
        },
        smoothBilateralFilter() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "9",
                        label: '邻域直径',
                        key: 'd',
                    },
                    {
                        type: 'input',
                        name: "50",
                        label: '灰度值相似度',
                        key: 'sigma_color',
                    },
                    {
                        type: 'input',
                        name: "50",
                        label: '空间邻近度',
                        key: 'sima_space',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/smooth_bilateral_filter/",
                    }
                ]
            };
        },
        contrastLinear() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "1.2",
                        label: '乘数因子',
                        key: 'alpha',
                    },
                    {
                        type: 'input',
                        name: "2",
                        label: '偏移量',
                        key: 'beta',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/contrast_linear/",
                    }
                ]
            };
        },
        contrastGamma() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/contrast_gamma/");
        },
        contrastEqualize() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/contrast_equalize/");
        },
        contrastClahe() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "4",
                        label: '阈值',
                        key: 'clip_limit',
                    },
                    {
                        type: 'submit',
                        clickUrl: "/contrast_clahe/",
                    }
                ]
            };
        },
        roberts() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/roberts/");
        },
        prewitt() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/prewitt/");
        },
        sobel() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [{}]
            };
            this.getActionResult("/sobel/");
        },
        laplacian() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: 1,
                        key: 'ksize',
                        label: "滤波器孔径大小",
                        options: [
                            {
                                value: 1,
                                label: "1x1",
                            },
                            {
                                value: 3,
                                label: "3x3",
                            },
                            {
                                value: 5,
                                label: "5x5",
                            },
                            {
                                value: 7,
                                label: "7x7",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/laplacian/",
                    }
                ]
            };
        },
        canny() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'input',
                        name: "50",
                        label: '低阈值',
                        key: 'minVal',
                    },
                    {
                        type: 'input',
                        name: "255",
                        label: '高阈值',
                        key: 'maxVal',
                    },
                    {
                        type: 'select',
                        name: 1,
                        key: 'ksize',
                        label: "滤波器孔径大小",
                        options: [
                            {
                                value: 1,
                                label: "1x1",
                            },
                            {
                                value: 3,
                                label: "3x3",
                            },
                            {
                                value: 5,
                                label: "5x5",
                            },
                            {
                                value: 7,
                                label: "7x7",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/canny/",
                    }
                ]
            };
        },
        fastNeuralStyle() {
            if (!this.imageExist) {
                this.imageNotExistMessage();
                return;
            }
            this.formData = {
                formItemList: [
                    {
                        type: 'select',
                        name: "starry_night",
                        key: 'model',
                        label: "预训练模型",
                        tagSelect: "fastNeuralStyle",
                        options: [
                            {
                                value: "starry_night",
                                label: "星夜",
                            },
                            {
                                value: "the_scream",
                                label: "呐喊",
                            },
                            {
                                value: "udnie",
                                label: "Udnie, Young American Girl",
                            },
                            {
                                value: "composition_vii",
                                label: "composition_vii",
                            },
                            {
                                value: "la_muse",
                                label: "缪斯",
                            },
                            {
                                value: "the_wave",
                                label: "神奈川冲浪里",
                            },
                            {
                                value: "mosaic",
                                label: "镶嵌艺术",
                            },
                            {
                                value: "candy",
                                label: "candy",
                            },
                            {
                                value: "feathers",
                                label: "feathers",
                            },
                        ]
                    },
                    {
                        type: 'submit',
                        clickUrl: "/fast_neural_style/",
                    },
                    {
                        type: 'styleImage',
                        src: "/frontend/static/images/style_image/starry_night.jpg",
                    }
                ]
            };
        },

        drawLine(data) {
            const that = this;
            let formDataTemp = this.formData.formItemList;
            console.log("临时" + formDataTemp);
            let canvas = that.canvas;
            let context = that.context;
            let origin = [0, 0];
            let width2height = [0, 0];
            let ImageData;
            //监听画板鼠标按下事件，开始绘画
            context.canvas.addEventListener("mousedown", startAction);
            //监听画板鼠标抬起事件，结束绘画
            context.canvas.addEventListener("mouseup", endAction);

            function startAction(event) {
                console.log("startAction:" + data["type"]);
                //监听鼠标移动，不是橡皮檫就画线
                if (!that.isClear) {
                    let rect = canvas.getBoundingClientRect();   //获取canvas边界。因为context.lineTo的坐标是相对于canvas的，而event.pageX的坐标是相对于整个页面的，所以要减去canvas的边界
                    switch (data["type"]) {
                        case "pan":
                            //开始新的路径
                            context.beginPath();
                            context.lineCap = "round";
                            //结束及开始圆形线帽
                            context.moveTo(event.pageX - rect.left, event.pageY - rect.top);
                            context.stroke();
                            break;
                        case "fillRect":
                            //console.log("fillRect");
                            origin = [event.pageX - rect.left, event.pageY - rect.top];
                            ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            //console.log(origin);
                            break;
                        case "strokeRect":
                            //console.log("strokeRect");
                            origin = [event.pageX - rect.left, event.pageY - rect.top];
                            ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            //console.log(origin);
                            break;
                        case "arc":
                            //console.log("strokeRect");
                            origin = [event.pageX - rect.left, event.pageY - rect.top];
                            ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            //console.log(origin);
                            break;
                        case "fillArc":
                            //console.log("strokeRect");
                            origin = [event.pageX - rect.left, event.pageY - rect.top];
                            ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            //console.log(origin);
                            break;
                    }

                }
                context.canvas.addEventListener("mousemove", moveAction);
            }

            //鼠标抬起事件
            function endAction() {
                //不再使用橡皮檫
                // that.isClear = false;
                //鼠标移动
                switch (data["type"]) {
                    case "pan":
                        break;
                    case "fillRect":
                        //context.globalAlpha=0.2;
                        context.fillRect(origin[0], origin[1], width2height[0], width2height[1]);
                        context.stroke();
                        origin = [0, 0];
                        width2height = [0, 0];
                        break;
                    case "strokeRect":
                        //context.globalAlpha=0.2;
                        context.strokeRect(origin[0], origin[1], width2height[0], width2height[1]);
                        origin = [0, 0];
                        width2height = [0, 0];
                        break;
                    case "arc":
                        //context.globalAlpha=0.2;
                        console.log("endActon:" + data["type"]);

                        console.log(width2height);
                        context.beginPath();
                        context.arc(width2height[0], width2height[1], width2height[2], 0, 2 * Math.PI);
                        context.stroke();
                        context.closePath();
                        origin = [0, 0];
                        width2height = [0, 0];
                        break;
                    case "fillArc":
                        //context.globalAlpha=0.2;
                        console.log("endActon:" + data["type"]);

                        console.log(width2height);
                        context.beginPath();
                        context.arc(width2height[0], width2height[1], width2height[2], 0, 2 * Math.PI);
                        context.fill();
                        context.stroke();
                        context.closePath();
                        origin = [0, 0];
                        width2height = [0, 0];
                        break;
                }
                context.canvas.removeEventListener("mousemove", moveAction);
            }

            function moveAction(event) {
                let rect = canvas.getBoundingClientRect();
                //判断是否是橡皮檫
                if (that.isClear) {
                    context.clearRect(event.pageX - 8 - rect.left, event.pageY - 8 - rect.top, 16, 16);
                    return;
                } else {
                    switch (data["type"]) {
                        case "pan":
                            context.lineTo(event.pageX - rect.left, event.pageY - rect.top);
                            context.stroke();
                            break;
                        case "fillRect":
                            context.putImageData(ImageData, 0, 0);
                            if (origin[0] !== 0 || origin[1] !== 0) {
                                width2height = [event.pageX - rect.left - origin[0], event.pageY - rect.top - origin[1]];
                                context.strokeRect(origin[0], origin[1], width2height[0], width2height[1]);

                            }

                            break;
                        case "strokeRect":
                            context.putImageData(ImageData, 0, 0);
                            if (origin[0] !== 0 || origin[1] !== 0) {
                                width2height = [event.pageX - rect.left - origin[0], event.pageY - rect.top - origin[1]];
                                context.strokeRect(origin[0], origin[1], width2height[0], width2height[1]);
                            }
                            break;
                        case "arc":
                            context.putImageData(ImageData, 0, 0);
                            if (origin[0] !== 0 || origin[1] !== 0) {
                                let arcX = (event.pageX - rect.left + origin[0]) / 2;  //圆心x
                                let arcY = (event.pageY - rect.top + origin[1]) / 2;   //圆心y
                                let radius = Math.sqrt(Math.pow(event.pageX - rect.left - origin[0], 2) + Math.pow(event.pageY - rect.top - origin[1], 2)) / 2;   //半径
                                width2height = [arcX, arcY, radius];
                                context.beginPath();
                                context.arc(width2height[0], width2height[1], width2height[2], 0, 2 * Math.PI);
                                context.stroke();
                                context.closePath();
                            }
                            break;
                        case "fillArc":
                            context.putImageData(ImageData, 0, 0);
                            if (origin[0] !== 0 || origin[1] !== 0) {
                                let arcX = (event.pageX - rect.left + origin[0]) / 2;  //圆心x
                                let arcY = (event.pageY - rect.top + origin[1]) / 2;   //圆心y
                                let radius = Math.sqrt(Math.pow(event.pageX - rect.left - origin[0], 2) + Math.pow(event.pageY - rect.top - origin[1], 2)) / 2;   //半径
                                width2height = [arcX, arcY, radius];
                                context.beginPath();
                                context.arc(width2height[0], width2height[1], width2height[2], 0, 2 * Math.PI);
                                context.fill();
                                context.stroke();
                                context.closePath();
                            }
                            break;
                    }
                }

            }

            return [startAction, moveAction, endAction];
        },
        getActionResult(url) {
            if (this.drawAction.length !== 0) {
                //移除存在的listener
                console.log(url);
                this.canvas.removeEventListener("mousedown", this.drawAction[0]);
                this.canvas.removeEventListener("mousemove", this.drawAction[1]);
                this.canvas.removeEventListener("mouseup", this.drawAction[2]);
            }
            this.loading = true;
            let data = {};
            this.formData.formItemList.forEach(function (item) {
                if (item.type === "input" || item.type === "select" || (item.type === "slider" && item.key === "angle")) {
                    //alert(item.name);
                    data[item.key] = item.name;
                }
            });
            this.formData.formItemList = [];
            axios.post(url, data)
                .then(res => {
                    if (res.status === 200) {
                        let dataType = res.headers["content-type"];
                        if (dataType.indexOf("image") !== -1) {        //如果返回的是图片
                            let imgSrc = "data:" + dataType + ";base64," + res.data;
                            this.canvasLoad(imgSrc);
                            this.loading = false;
                        } else {          //如果不是，返回错误信息
                            this.loading = false;
                            this.$message({
                                message: res.data["error"],
                                type: 'warning'
                            });
                        }

                    }
                })
        },
        //将图片加载到canvas
        canvasLoad(src) {
            let canvas = document.getElementById("pictureCanvas");
            let cW = document.getElementById("myCanvas").offsetWidth * 0.95;  //获取元素宽度
            let cH = document.getElementById("myCanvas").offsetHeight * 0.95; //获取元素高度
            let context = canvas.getContext('2d');
            let img = new Image();
            img.src = src;
            //加载图片
            img.onload = () => {
                if (img.complete) {
                    //根据图像设定canvas的长宽
                    //绘制图像
                    //保存图像尺寸
                    this.fileData.width = img.width;
                    this.fileData.height = img.height;

                    let originImgWidth = img.width;   //图片原始尺寸
                    let originImgHeight = img.height;
                    // if (cW / cH > originImgWidth / originImgHeight) {
                    //     img.width = originImgWidth * cH / originImgHeight;
                    //     img.height = cH;
                    // } else {
                    //     img.width = cW;
                    //     img.height = originImgHeight * cW / originImgWidth;
                    // }
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0, img.width, img.height);
                }
            };
        },
        //input失去焦点
        inputChange(value, key) {
            console.log(value);
            if (this.formData.formItemList[this.formData.formItemList.length - 1].clickUrl === "/resize2/") {    //如果是改变图像大小
                if (key === "width") {
                    console.log(value * (this.fileData.height / this.fileData.width));
                    this.formData.formItemList.splice(0, 2,
                        {
                            type: 'input',
                            name: value,
                            label: '宽度(px)',
                            key: 'width',
                        },
                        {
                            type: 'input',
                            name: (value * (this.fileData.height / this.fileData.width)).toFixed(3),    //取小数点后三位，防止小数点位数超出float
                            label: '高度(px)',
                            key: 'height',
                        },);
                } else if (key === "height") {
                    this.formData.formItemList.splice(0, 2,
                        {
                            type: 'input',
                            name: (value * (this.fileData.width / this.fileData.height)).toFixed(3),
                            label: '宽度(px)',
                            key: 'width',
                        },
                        {
                            type: 'input',
                            name: value,
                            label: '高度(px)',
                            key: 'height',
                        },);
                }
            }
        },
        //选择器的值发生变化
        handleSelectChange(value, tagSelect) {
            console.log("handleSelectChange" + value);
            if (tagSelect === "edit") {     //如果是编辑器的选择器
                let data = {};
                let listLength = this.formData.formItemList.length;
                this.context.lineWidth=1;
                switch (value) {
                    case 0:     //如果是画笔
                        this.formData.formItemList.splice(1, listLength - 4,
                            {
                                type: 'colorPicker',
                                colorPick: "",
                                name: 0,
                                predefineColors: [
                                    '#ffffff',
                                ],
                                label: "选择画笔颜色：",
                            },
                            {
                                type: 'slider',
                                value: 1,
                                name: 0,
                                min: 1,
                                max: 200,
                                spanText: "画笔宽度",
                                step: 1,
                                marks: {},
                            },
                        );     //删除中间的元素，并添加新的
                        data = {
                            "type": "pan",
                        };
                        break;
                    case 1: //如果是填充矩形
                        this.formData.formItemList.splice(1, listLength - 4,
                            {
                                type: 'colorPicker',
                                colorPick: "",
                                name: 1,
                                predefineColors: [
                                    '#ffffff',
                                ],
                                label: "选择填充矩形颜色：",
                            },
                        );
                        data = {
                            "type": "fillRect",
                        };
                        break;
                    case 2: //如果是边框矩形
                        this.formData.formItemList.splice(1, listLength - 4,
                            {
                                type: 'colorPicker',
                                colorPick: "",
                                name: 2,
                                predefineColors: [
                                    '#ffffff',
                                ],
                                label: "选择边框矩形颜色：",
                            },
                        );
                        data = {
                            "type": "strokeRect",
                        };
                        break;
                    case 3: //如果是圆
                        this.formData.formItemList.splice(1, listLength - 4,
                            {
                                type: 'colorPicker',
                                colorPick: "",
                                name: 3,
                                predefineColors: [
                                    '#ffffff',
                                ],
                                label: "选择圆颜色：",
                            },
                        );
                        data = {
                            "type": "arc",
                        };
                        break;
                    case 4: //如果是填充圆
                        this.formData.formItemList.splice(1, listLength - 4,
                            {
                                type: 'colorPicker',
                                colorPick: "",
                                name: 3,
                                predefineColors: [
                                    '#ffffff',
                                ],
                                label: "选择填充圆颜色：",
                            },
                        );
                        data = {
                            "type": "fillArc",
                        };
                        break;
                }
                console.log(this.formData.formItemList);
                console.log("data:" + data["type"]);
                //移除存在的listener
                this.canvas.removeEventListener("mousedown", this.drawAction[0]);
                this.canvas.removeEventListener("mousemove", this.drawAction[1]);
                this.canvas.removeEventListener("mouseup", this.drawAction[2]);

                this.drawAction = this.drawLine(data);
            } else if (tagSelect === "fastNeuralStyle") { //如果是风格化迁移的选择器
                switch (value) {
                    case "starry_night":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/starry_night.jpg";
                        break;
                    case "the_scream":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/The_Scream.jpg";
                        break;
                    case "udnie":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/Udnie.jpg";
                        break;
                    case "composition_vii":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/Composition_7.jpg";
                        break;
                    case "la_muse":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/a-muse-1935.jpg";
                        break;
                    case "the_wave":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/Tsunami.jpg";
                        break;
                    case "mosaic":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/mosaic.jpg";
                        break;
                    case "candy":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/candy.jpg";
                        break;
                    case "feathers":
                        this.formData.formItemList[2].src = "/frontend/static/images/style_image/feathers-leaves-petals-sm.jpeg";
                        break;
                }
            }
        },
        clickToResult(clickToDo) {
            switch (clickToDo) {
                case "clear":    //如果是清屏
                    axios.post("/get_current_picture/").then(res => {
                        if (res.status === 200) {
                            let dataType = res.headers["content-type"];
                                if (dataType.indexOf("image") !== -1) {        //如果返回的是图片
                                    let imgSrc = "data:" + dataType + ";base64," + res.data;
                                    this.canvasLoad(imgSrc);
                                }
                        }
                    });
                    break;
                case "save":    //如果是保存
                    this.canvas.removeEventListener("mousedown", this.drawAction[0]);
                    this.canvas.removeEventListener("mousemove", this.drawAction[1]);
                    this.canvas.removeEventListener("mouseup", this.drawAction[2]);
                    let img = this.canvas.toDataURL('image/jpg');
                    let param = new FormData();
                    param.append("file", img);
                    let url = "/edit/";
                    this.formData.formItemList = [];
                    axios.post(url, param).then(res => {
                        if (res.status === 200) {
                            if (res.data["msg"] === "ok") {
                                this.canvasLoad(img);
                                console.log("编辑保存成功");
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                            }
                        }
                    });
                    break;
                case "eraser":  //如果是橡皮檫
                    this.isClear = this.isClear !== true;
                    this.$notify.info({
                        title: '提示',
                        message: '再次点击关闭/打开橡皮檫'
                    });
                    break;
                case "createFile":    //如果是新建
                    console.log("createFile");
                    let img1 = this.canvas.toDataURL('image/jpg');
                    console.log(img1);
                    let param1 = new FormData();
                    param1.append("file", img1);
                    param1.append("fileName", this.fileData.fileName + ".jpg");
                    let url1 = "/createFile/";
                    axios.post(url1, param1).then(res => {
                        if (res.status === 200) {
                            if (res.data["msg"] === "ok") {
                                this.canvasLoad(img1);
                                console.log("新建保存成功")
                            }
                        }
                    });
                    break;
                default:
                    console.log("error");
            }
        },
        //定义画笔颜色
        handleChangeColor(color, type) {
            console.log(type);
            this.context.strokeStyle = color;
            this.context.fillStyle = color;

        },
        //定义画笔宽度
        handleChangeWidth(Width, type) {
            if (type === 0) {
                console.log(Width);
                this.context.lineWidth = Width;
            }
        },
        imageNotExistMessage() {
            this.$message('请先打开或新建文件');
        }
    },

});

