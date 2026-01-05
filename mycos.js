// ==UserScript==
// @name         自动评教：MyCOS / 麦可思 实时自动填写版
// @version      1.0.0
// @author       AI Assistant
// @match        *://*.edu.cn/*
// @match        *://*.mycospxk.com/*
// @run-at       document-idle
// ==/UserScript==

(function ($) {
  'use strict';

  const config = {
    radio: [0, 1], // 随机选择第1或第2个选项
    comment: "老师授课认真，讲解清晰，课程内容充实，受益匪浅。",
    reviewHref: "answer"
  };

  // 模拟输入逻辑
  const fillInput = (element, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    if (setter) {
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // 核心填充逻辑
  const doFill = () => {
    // 只有在评价页面才执行
    if (!window.location.href.includes(config.reviewHref)) return;

    // 1. 处理单选：只寻找【尚未选中】任何选项的题目组
    const unfilledRadioGroups = $(".ant-radio-group").filter((i, el) => {
      return $(el).find(".ant-radio-wrapper-checked, .ant-radio-checked").length === 0;
    });

    if (unfilledRadioGroups.length > 0) {
      console.log(`[自动评教] 发现 ${unfilledRadioGroups.length} 组未填充单选题，开始填写...`);
      unfilledRadioGroups.each((i, group) => {
        const options = $(group).find(".ant-radio-wrapper");
        const targetIdx = config.radio[Math.floor(Math.random() * config.radio.length)];
        if (options.eq(targetIdx).length) {
          options.eq(targetIdx).trigger("click");
        }
      });
    }

    // 2. 处理多选：只勾选【尚未选中】的框
    $(".ant-checkbox-group").find(".ant-checkbox").each((i, el) => {
      if (!$(el).hasClass("ant-checkbox-checked")) {
        $(el).find(".ant-checkbox-input").trigger("click");
      }
    });

    // 3. 处理文本框：只填充【内容为空】的文本框
    $(".ant-input").each((i, el) => {
      if ($(el).val().trim() === "") {
        fillInput(el, config.comment);
      }
    });
  };

  let throttleTimer = null;
  const observer = new MutationObserver(() => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      doFill();
      throttleTimer = null;
    }, 500); // 每 0.5 秒最多检测一次
  });

  // 开始观察页面
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 初始进入页面执行一次
  $(doFill);


})(jQuery);
