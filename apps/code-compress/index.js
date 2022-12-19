/**
 * FeHelper Code Compress
 */
let editor = {};

new Vue({
    el: '#pageContainer',
    data: {
        codeType: 'html',
        sourceContent: '',
        resultContent: '',
        hasError: false,
        compressInfo: ''
    },

    mounted: function () {

        editor = CodeMirror.fromTextArea(this.$refs.codeSource, {
            mode: "htmlmixed",
            lineNumbers: true,
            matchBrackets: true,
            styleActiveLine: true,
            lineWrapping: true
        });

        //输入框聚焦
        editor.focus();
    },

    methods: {
        compress: function () {
            this.hasError = false;
            this.compressInfo = '';
            this.sourceContent = editor.getValue().trim();

            if (!this.sourceContent) {
                alert('请先粘贴您需要压缩的代码');
            } else {
                if (this.codeType === 'js') {
                    this.jsCompress(this.sourceContent);
                } else if (this.codeType === 'css') {
                    this.cssCompress(this.sourceContent);
                } else {
                    this.htmlCompress(this.sourceContent);
                }
            }
        },

        changeCodeType(ctype) {
            let editorMode = {
                css: 'text/css',
                js: {name: 'javascript', json: true},
                html: 'htmlmixed'
            };
            editor.setOption('mode', editorMode[ctype]);
            if (editor.getValue().trim()) {
                this.$nextTick(this.compress);
            }
        },

        buildCompressInfo(original, minified) {
            let commify = str => String(str).split('').reverse().join('').replace(/(...)(?!$)/g, '$1,').split('').reverse().join('');
            let diff = original.length - minified.length;
            let savings = original.length ? (100 * diff / minified.length).toFixed(2) : 0;
            this.compressInfo = '压缩前: <strong>' + commify(original.length) + '</strong>' +
                '，压缩后: <strong>' + commify(minified.length) + '</strong>' +
                '，压缩率: <strong>' + commify(diff) + ' (' + savings + '%)</strong>';
        },

        jsCompress(js) {
            let result = UglifyJs3.compress(js);
            this.hasError = !!result.error;
            this.resultContent = result.out || result.error;
            !this.hasError && this.buildCompressInfo(this.sourceContent, this.resultContent);
        },

        cssCompress(css) {
            let res = css.replace(/\/\*(.|\n)*?\*\//g, "")
                .replace(/\s*([\{\}\:\;\,])\s*/g, "$1")
                .replace(/\,[\s\.\#\d]*\{/g, "{")
                .replace(/;\s*;/g, ";")
                .match(/^\s*(\S+(\s+\S+)*)\s*$/);
            this.resultContent = (res === null) ? css : res[1];
            this.buildCompressInfo(this.sourceContent, this.resultContent);
        },

        htmlCompress(html) {
            let options = {
                "caseSensitive": false,
                "collapseBooleanAttributes": true,
                "collapseInlineTagWhitespace": false,
                "collapseWhitespace": true,
                "conservativeCollapse": false,
                "decodeEntities": true,
                "html5": true,
                "includeAutoGeneratedTags": false,
                "keepClosingSlash": false,
                "minifyCSS": true,
                "minifyJS": true,
                "preserveLineBreaks": false,
                "preventAttributesEscaping": false,
                "processConditionalComments": true,
                "processScripts": ["text/html"],
                "removeAttributeQuotes": true,
                "removeComments": true,
                "removeEmptyAttributes": true,
                "removeEmptyElements": false,
                "removeOptionalTags": true,
                "removeRedundantAttributes": true,
                "removeScriptTypeAttributes": true,
                "removeStyleLinkTypeAttributes": true,
                "removeTagWhitespace": true,
                "sortAttributes": true,
                "sortClassName": true,
                "trimCustomFragments": true,
                "useShortDoctype": true
            };
            options.log = console.log;
            try {
                this.resultContent = require('html-minifier').minify(html, options);
                this.buildCompressInfo(this.sourceContent, this.resultContent);
            } catch (err) {
                this.hasError = true;
                this.resultContent = err;
            }
        },

        toast(content) {
            window.clearTimeout(window.feHelperAlertMsgTid);
            let elAlertMsg = document.querySelector("#fehelper_alertmsg");
            if (!elAlertMsg) {
                let elWrapper = document.createElement('div');
                elWrapper.innerHTML = '<div id="fehelper_alertmsg">' + content + '</div>';
                elAlertMsg = elWrapper.childNodes[0];
                document.body.appendChild(elAlertMsg);
            } else {
                elAlertMsg.innerHTML = content;
                elAlertMsg.style.display = 'block';
            }

            window.feHelperAlertMsgTid = window.setTimeout(function () {
                elAlertMsg.style.display = 'none';
            }, 3000);
        },
        copyToClipboard(text) {
            if (this.hasError) return false;

            let input = document.createElement('textarea');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('Copy');
            document.body.removeChild(input);

            this.toast('压缩结果已复制成功，随处粘贴可用！');
        }
    }
});