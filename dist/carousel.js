/**
 * Vue 3 Carousel 0.1.11
 * (c) 2021
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueCarousel = {}, global.Vue));
}(this, (function (exports, vue) { 'use strict';

  function counterFactory() {
      return new Proxy({ value: 0, read: 0 }, {
          get(obj, prop) {
              if (!(prop in obj))
                  return 0;
              if (prop === 'read') {
                  return obj[prop];
              }
              return obj[prop]++;
          },
          set(obj, prop, value) {
              obj[prop] = Math.max(value, 0);
              return true;
          },
      });
  }

  /**
   * return a debounced version of the function
   * @param fn
   * @param delay
   */
  function debounce(fn, delay) {
      let timerId;
      return function (...args) {
          if (timerId) {
              clearTimeout(timerId);
          }
          timerId = setTimeout(() => {
              fn(...args);
              timerId = null;
          }, delay);
      };
  }
  /**
   * return a throttle version of the function
  * Throttling
  *
  */
  function throttle(fn, limit) {
      let inThrottle;
      return function (...args) {
          const self = this;
          if (!inThrottle) {
              fn.apply(self, args);
              inThrottle = true;
              setTimeout(() => (inThrottle = false), limit);
          }
      };
  }

  var Carousel = vue.defineComponent({
      name: 'Carousel',
      props: {
          // count of items to showed per view
          itemsToShow: {
              default: 1,
              type: Number,
          },
          // slide number number of initial slide
          currentSlide: {
              default: 0,
              type: Number,
          },
          // control infinite scrolling mode
          wrapAround: {
              default: false,
              type: Boolean,
          },
          // control snap position alignment
          snapAlign: {
              default: 'center',
              validator(value) {
                  // The value must match one of these strings
                  return ['start', 'end', 'center'].includes(value);
              },
          },
          // sliding transition time in ms
          transition: {
              default: 300,
              type: Number,
          },
          // an object to pass all settings
          settings: {
              default() {
                  return {};
              },
              type: Object,
          },
          // an object to store breakpoints
          breakpoints: {
              default: null,
              type: Object,
          },
          // disable touch 
          disabledTouch: {
              default: false,
              type: Boolean
          },
      },
      setup(props, { slots }) {
          const root = vue.ref(null);
          const slides = vue.ref([]);
          const slidesBuffer = vue.ref([]);
          const slideWidth = vue.ref(0);
          const slidesCount = vue.ref(1);
          const slidesCounter = counterFactory();
          // generate carousel configs
          const defaultConfig = Object.assign(Object.assign({}, props), props.settings);
          const breakpoints = vue.ref(Object.assign({}, defaultConfig.breakpoints));
          // remove extra values
          delete defaultConfig.settings;
          delete defaultConfig.breakpoints;
          // current config
          const config = vue.reactive(Object.assign({}, defaultConfig));
          // slides
          const currentSlide = vue.ref(config.currentSlide);
          const prevSlide = vue.ref(0);
          const middleSlide = vue.ref(0);
          vue.provide('config', config);
          vue.provide('slidesBuffer', slidesBuffer);
          vue.provide('slidesCount', slidesCount);
          vue.provide('currentSlide', currentSlide);
          vue.provide('slidesCounter', slidesCounter);
          const { default: slotDefault, slides: slotSlides, addons: slotAddons } = slots;
          const slidesElements = (slotSlides === null || slotSlides === void 0 ? void 0 : slotSlides()) || (slotDefault === null || slotDefault === void 0 ? void 0 : slotDefault()) || [];
          const addonsElements = (slotAddons === null || slotAddons === void 0 ? void 0 : slotAddons()) || [];
          vue.watchEffect(() => {
              var _a;
              slides.value = ((_a = slidesElements[0]) === null || _a === void 0 ? void 0 : _a.children) || [];
              // Handel when slides added/removed
              const needToUpdate = slidesCount.value !== slides.value.length;
              if (needToUpdate) {
                  updateSlidesData();
                  updateSlidesBuffer();
              }
              if (slidesCounter.read) {
                  slidesCounter.value = slides.value.length - 1;
              }
          });
          /**
           * Breakpoints
           */
          function updateConfig() {
              const breakpointsArray = Object.keys(breakpoints.value)
                  .map((key) => Number(key))
                  .sort((a, b) => +b - +a);
              let newConfig = Object.assign({}, defaultConfig);
              breakpointsArray.some((breakpoint) => {
                  const isMatched = window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
                  if (isMatched) {
                      newConfig = Object.assign(Object.assign({}, newConfig), breakpoints.value[breakpoint]);
                      return true;
                  }
                  return false;
              });
              Object.keys(newConfig).forEach((key) => (config[key] = newConfig[key]));
          }
          const handleWindowResize = debounce(() => {
              if (breakpoints.value)
                  updateConfig();
              updateSlideWidth();
          }, 16);
          /**
           * Setup functions
           */
          function updateSlideWidth() {
              if (!root.value)
                  return;
              const rect = root.value.getBoundingClientRect();
              slideWidth.value = rect.width / config.itemsToShow;
          }
          function updateSlidesData() {
              slidesCount.value = slides.value.length;
              middleSlide.value = Math.ceil((slidesCount.value - 1) / 2);
          }
          function updateSlidesBuffer() {
              const slidesArray = [...Array(slidesCount.value).keys()];
              if (config.wrapAround) {
                  const shifts = currentSlide.value + middleSlide.value + 1;
                  for (let i = 0; i < shifts; i++) {
                      slidesArray.push(Number(slidesArray.shift()));
                  }
              }
              slidesBuffer.value = slidesArray;
          }
          vue.onMounted(() => {
              updateSlideWidth();
              if (breakpoints.value)
                  updateConfig();
              // @ts-ignore
              window.addEventListener('resize', handleWindowResize, { passive: true });
          });
          /**
           * Carousel Event listeners
           */
          let isTouch = false;
          const startPosition = { x: 0, y: 0 };
          const endPosition = { x: 0, y: 0 };
          const dragged = vue.reactive({ x: 0, y: 0 });
          const isDragging = vue.ref(false);
          const handleDrag = throttle((event) => {
              endPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
              endPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
              const deltaX = endPosition.x - startPosition.x;
              const deltaY = endPosition.y - startPosition.y;
              dragged.y = deltaY;
              dragged.x = deltaX;
              if (!isTouch) {
                  event.preventDefault();
              }
          }, 16);
          function handleDragStart(event) {
              if (this.disabledTouch)
                  return;
              isTouch = event.type === 'touchstart';
              if ((!isTouch && event.button !== 0) || isSliding.value) {
                  return;
              }
              isDragging.value = true;
              startPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
              startPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
              // @ts-ignore
              document.addEventListener(isTouch ? 'touchmove' : 'mousemove', handleDrag);
              document.addEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd);
          }
          function handleDragEnd() {
              isDragging.value = false;
              const tolerance = Math.sign(dragged.x) * 0.4;
              const draggedSlides = Math.round(dragged.x / slideWidth.value + tolerance);
              slideTo(currentSlide.value - draggedSlides);
              dragged.x = 0;
              dragged.y = 0;
              // @ts-ignore
              document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', handleDrag);
              document.removeEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd);
          }
          /**
           * Navigation function
           */
          const isSliding = vue.ref(false);
          function slideTo(slideIndex) {
              if (currentSlide.value === slideIndex || isSliding.value) {
                  return;
              }
              // Wrap slide index
              const lastSlideIndex = slidesCount.value - 1;
              if (slideIndex > lastSlideIndex) {
                  return slideTo(slideIndex - slidesCount.value);
              }
              if (slideIndex < 0) {
                  return slideTo(slideIndex + slidesCount.value);
              }
              isSliding.value = true;
              prevSlide.value = currentSlide.value;
              currentSlide.value = slideIndex;
              setTimeout(() => {
                  if (config.wrapAround) {
                      updateSlidesBuffer();
                  }
                  isSliding.value = false;
              }, config.transition);
          }
          function next() {
              const isLastSlide = currentSlide.value >= slidesCount.value - 1;
              if (!isLastSlide) {
                  slideTo(currentSlide.value + 1);
                  return;
              }
              // if wrap around to the first slide
              if (config.wrapAround) {
                  slideTo(0);
              }
          }
          function prev() {
              const isFirstSlide = currentSlide.value <= 0;
              if (!isFirstSlide) {
                  slideTo(currentSlide.value - 1);
                  return;
              }
              // if wrap around to the last slide
              if (config.wrapAround) {
                  slideTo(slidesCount.value - 1);
              }
          }
          const nav = { slideTo, next, prev };
          vue.provide('nav', nav);
          /**
           * Track style
           */
          const slidesToScroll = vue.computed(() => {
              let output = slidesBuffer.value.indexOf(currentSlide.value);
              if (config.snapAlign === 'center') {
                  output -= (config.itemsToShow - 1) / 2;
              }
              if (config.snapAlign === 'end') {
                  output -= config.itemsToShow - 1;
              }
              if (!config.wrapAround) {
                  const max = slidesCount.value - config.itemsToShow;
                  const min = 0;
                  output = Math.max(Math.min(output, max), min);
              }
              return output;
          });
          const trackStyle = vue.computed(() => {
              const xScroll = dragged.x - slidesToScroll.value * slideWidth.value;
              return {
                  transform: `translateX(${xScroll}px)`,
                  transition: `${isSliding.value ? config.transition : 0}ms`,
              };
          });
          return () => {
              const trackEl = vue.h('ol', {
                  class: 'carousel__track',
                  style: trackStyle.value,
                  onMousedown: handleDragStart,
                  onTouchstart: handleDragStart,
              }, slidesElements);
              const viewPortEl = vue.h('div', { class: 'carousel__viewport' }, trackEl);
              return vue.h('section', {
                  ref: root,
                  class: 'carousel',
                  'aria-label': 'Gallery',
              }, [viewPortEl, addonsElements]);
          };
      },
  });

  const icons = {
      arrowUp: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
      arrowDown: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
      arrowRight: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
      arrowLeft: 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
  };

  const Icon = (props) => {
      const iconName = props.name;
      if (!iconName || typeof iconName !== 'string') {
          return;
      }
      const path = icons[iconName];
      const pathEl = vue.h('path', { d: path });
      props.title || iconName;
      const titleEl = vue.h('title', null, iconName);
      return vue.h('svg', {
          class: 'carousel__icon',
          viewBox: '0 0 24 24',
          role: 'img',
      }, [titleEl, pathEl]);
  };
  Icon.props = { name: String, title: String };

  const Navigation = (props, { slots }) => {
      const { next: slotNext, prev: slotPrev } = slots;
      const nav = vue.inject('nav', {});
      const prevButton = vue.h('button', { class: 'carousel__prev', onClick: nav.prev }, (slotPrev === null || slotPrev === void 0 ? void 0 : slotPrev()) || vue.h(Icon, { name: 'arrowLeft' }));
      const nextButton = vue.h('button', { class: 'carousel__next', onClick: nav.next }, (slotNext === null || slotNext === void 0 ? void 0 : slotNext()) || vue.h(Icon, { name: 'arrowRight' }));
      return [prevButton, nextButton];
  };

  var Slide = vue.defineComponent({
      name: 'CarouselSlide',
      props: {
          order: {
              type: Number,
              default: 1,
          },
      },
      setup(_, { slots }) {
          const config = vue.inject('config', vue.reactive({}));
          const slidesBuffer = vue.inject('slidesBuffer', vue.ref([]));
          const slidesCounter = vue.inject('slidesCounter');
          const slideOrder = slidesCounter.value;
          const wrapOrder = vue.ref(slideOrder);
          if (config.wrapAround) {
              updateOrder();
              vue.watchEffect(updateOrder);
          }
          function updateOrder() {
              wrapOrder.value = slidesBuffer.value.indexOf(slideOrder);
          }
          const slideStyle = vue.computed(() => {
              const items = config.itemsToShow;
              const width = `${(1 / items) * 100}%`;
              return {
                  width,
                  order: wrapOrder.value.toString(),
              };
          });
          return () => { var _a; return vue.h('li', { style: slideStyle.value, class: 'carousel__slide' }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)); };
      },
  });

  const Pagination = () => {
      const slidesCount = vue.inject('slidesCount', vue.ref(1));
      const currentSlide = vue.inject('currentSlide', vue.ref(1));
      const nav = vue.inject('nav', {});
      function handleButtonClick(slideNumber) {
          nav.slideTo(slideNumber);
      }
      const children = [];
      for (let slide = 0; slide < slidesCount.value; slide++) {
          const button = vue.h('button', {
              class: {
                  'carousel__pagination-button': true,
                  'carousel__pagination-button--active': currentSlide.value === slide,
              },
              onClick: () => handleButtonClick(slide),
          });
          const item = vue.h('li', { class: 'carousel__pagination-item', key: slide }, button);
          children.push(item);
      }
      return vue.h('ol', { class: 'carousel__pagination' }, children);
  };

  exports.Carousel = Carousel;
  exports.Icon = Icon;
  exports.Navigation = Navigation;
  exports.Pagination = Pagination;
  exports.Slide = Slide;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
