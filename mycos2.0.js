// ==UserScript==
// @name         自动评教：MyCOS全自动秒杀版
// @version      2.2.0
// @author       AI Assistant
// @match        *://*.edu.cn/*
// @match        *://*.mycospxk.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

// --- 第一部分：秒跳 5 秒等待逻辑 (必须在最开头) ---
(function() {
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay) {
        // 只要延迟在 1-5 秒之间，直接改为 0
        if (delay >= 1000 && delay <= 5005) {
            return originalSetTimeout(callback, 0);
        }
        return originalSetTimeout(callback, delay);
    };
    console.log("[全自动评教] 倒计时秒跳插件已就绪。");
})();

// --- 第二部分：核心自动填写、提交、切换逻辑 ---
(function ($) {
    'use strict';

    const config = {
        radioIdx: [0, 1], // 随机选第1或第2个选项
        comment: "老师授课认真，讲解清晰，课程内容充实，受益匪浅。",
        reviewHref: "answer",
        autoSubmit: true,  // 自动提交
        autoNext: true     // 自动下一位老师/下一门课程
    };

    // 模拟原生输入，绕过框架拦截
    const fillInput = (element, value) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        if (setter) {
            setter.call(element, value);
            element.dispatchEvent(new Event("input", { bubbles: true }));
        }
    };

    const doWork = () => {
        // 1. 只有在评价页面才执行填写逻辑
        if (window.location.href.includes(config.reviewHref)) {

            // A. 自动填充单选
            const unfilledRadios = $(".ant-radio-group").filter((i, el) => {
                return $(el).find(".ant-radio-wrapper-checked, .ant-radio-checked").length === 0;
            });
            unfilledRadios.each((i, group) => {
                const options = $(group).find(".ant-radio-wrapper");
                const target = config.radioIdx[Math.floor(Math.random() * config.radioIdx.length)];
                if (options.eq(target).length) options.eq(target).trigger("click");
            });

            // B. 自动填充多选
            $(".ant-checkbox-group").find(".ant-checkbox:not(.ant-checkbox-checked)").each((i, el) => {
                $(el).find(".ant-checkbox-input").trigger("click");
            });

            // C. 自动填充文本框
            $(".ant-input").each((i, el) => {
                if ($(el).val().trim() === "") fillInput(el, config.comment);
            });

            // D. 自动点击“提交”按钮
            if (config.autoSubmit) {
                const submitBtn = $('.ant-btn-primary').filter((i, el) => {
                    const text = $(el).text();
                    return text.includes("提 交") || text.includes("确 定") || text.includes("确定");
                });
                if (submitBtn.length > 0 && !submitBtn.prop('disabled')) {
                    submitBtn.trigger('click');
                }
            }
        }

        // 2. 无论是否在评价页，都实时监控并点击“跳转”按钮
        if (config.autoNext) {
            // 查找所有可能的跳转按钮：下一位教师、下一门课程、返回列表、确定（成功弹窗）
            const nextBtn = $('.ant-btn, .ant-btn-primary').filter((i, el) => {
                const txt = $(el).text();
                return txt.includes("下一位教师") ||
                       txt.includes("下一门课程") ||
                       txt.includes("下一门") ||
                       txt.includes("返回列表");
            });

            if (nextBtn.length > 0) {
                console.log(`[全自动评教] 检测到跳转按钮: ${nextBtn.text()}，正在自动点击...`);
                nextBtn.trigger('click');
            }
        }
    };

    // 使用 MutationObserver 监控 DOM 变化
    let throttle = null;
    const observer = new MutationObserver(() => {
        if (throttle) return;
        throttle = setTimeout(() => {
            doWork();
            throttle = null;
        }, 500); // 0.5秒节流，平衡速度与稳定性
    });

    const init = () => {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            doWork();
        } else {
            setTimeout(init, 100);
        }
    };

    init();

})(jQuery);