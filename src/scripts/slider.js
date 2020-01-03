import {
  $,
  addClass,
  removeClass,
  hasClass,
  addListenerMulti,
  removeListenerMulti
} from "./utils";

class Slider {
  constructor(settings) {
    this.def = {
      target: $(".slider"),
      dotsWrapper: $(".dots-wrapper"),
      arrowLeft: $(".arrow-left"),
      arrowRight: $(".arrow-right"),
      transition: {
        speed: 300,
        easing: ""
      },
      swipe: true,
      autoHeight: true,
      afterChangeSlide: this.afterChangeSlide,
      ...settings
    };

    this.allSlides = 0;
    this.curSlide = 0;
    this.curLeft = 0;
    this.totalSlides = this.def.target.querySelectorAll(".slide").length;
    this.sliderInner = this.def.target.querySelector(".slider-inner");
    this.loadedCnt = 0;

    this.buildDots = this.buildDots.bind(this);
    this.loadedImg = this.loadedImg.bind(this);
    this.getCurLeft = this.getCurLeft.bind(this);
    this.startSwipe = this.startSwipe.bind(this);
    this.swipeMove = this.swipeMove.bind(this);
    this.swipeEnd = this.swipeEnd.bind(this);
    this.gotoSlide = this.gotoSlide.bind(this);
    this.initArrows = this.initArrows.bind(this);
    this.setDot = this.setDot.bind(this);
    this.updateSliderDimension = this.updateSliderDimension.bind(this);
  }

  afterChangeSlide() {}

  buildDots() {
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement("li");
      dot.setAttribute("data-slide", i + 1);
      this.def.dotsWrapper.appendChild(dot);
    }

    this.def.dotsWrapper.addEventListener(
      "click",
      e => {
        if (e.target && e.target.nodeName == "LI") {
          this.curSlide = e.target.dataset.slide;
          this.gotoSlide();
        }
      },
      false
    );
  }

  loadedImg(el) {
    //lazy load images
    let loaded = false;
    const img = el.querySelector("img");

    function loadHandler() {
      if (loaded) return;

      loaded = true;
      this.loadedCnt++;

      if (this.loadedCnt >= this.totalSlides + 2) this.updateSliderDimension();
    }

    if (img) {
      img.onload = loadHandler;
      img.src = img.getAttribute("data-src");
      img.style.display = "block";
      img.complete && loadHandler();
    } else this.updateSliderDimension();
  }

  getCurLeft() {
    this.curLeft = parseInt(this.sliderInner.style.left.split("px")[0]);
  }

  startSwipe(e) {
    let touch = e;

    this.getCurLeft();
    if (!this.isAnimating) {
      if (e.type == "touchstart") {
        touch = e.targetTouches[0] || e.changedTouches[0];
      }
      this.startX = touch.pageX;
      this.startY = touch.pageY;

      addListenerMulti(this.sliderInner, "mousemove touchmove", this.swipeMove);
      addListenerMulti($("body"), "mouseup touchend", this.swipeEnd);
    }
  }

  swipeMove(e) {
    var touch = e;
    if (e.type == "touchmove") {
      touch = e.targetTouches[0] || e.changedTouches[0];
    }

    this.moveX = touch.pageX;
    this.moveY = touch.pageY;

    // for scrolling up and down
    if (Math.abs(this.moveX - this.startX) < 40) return;

    this.isAnimating = true;
    addClass(this.def.target, "isAnimating");
    e.preventDefault();

    if (this.curLeft + this.moveX - this.startX > 0 && this.curLeft == 0) {
      this.curLeft = -this.totalSlides * this.slideW;
    } else if (
      this.curLeft + this.moveX - this.startX <
      -(this.totalSlides + 1) * this.slideW
    ) {
      this.curLeft = -this.slideW;
    }
    this.sliderInner.style.left =
      this.curLeft + this.moveX - this.startX + "px";
  }

  swipeEnd(e) {
    var touch = e;
    this.getCurLeft();
    if (Math.abs(this.moveX - this.startX) === 0) return;
    this.stayAtCur =
      Math.abs(this.moveX - this.startX) < 40 ||
      typeof this.moveX === "undefined"
        ? true
        : false;
    this.dir = this.startX < this.moveX ? "left" : "right";
    if (this.stayAtCur) {
    } else {
      this.dir == "left" ? this.curSlide-- : this.curSlide++;
      if (this.curSlide < 0) {
        this.curSlide = this.totalSlides;
      } else if (this.curSlide == this.totalSlides + 2) {
        this.curSlide = 1;
      }
    }
    this.gotoSlide();
    delete this.startX;
    delete this.startY;
    delete this.moveX;
    delete this.moveY;
    this.isAnimating = false;
    removeClass(this.def.target, "isAnimating");
    removeListenerMulti(
      this.sliderInner,
      "mousemove touchmove",
      this.swipeMove
    );
    removeListenerMulti($("body"), "mouseup touchend", this.swipeEnd);
  }

  gotoSlide() {
    this.sliderInner.style.transition =
      "left " +
      this.def.transition.speed / 1000 +
      "s " +
      this.def.transition.easing;

    this.sliderInner.style.left = -this.curSlide * this.slideW + "px";
    addClass(this.def.target, "isAnimating");

    setTimeout(() => {
      this.sliderInner.style.transition = "";
      removeClass(this.def.target, "isAnimating");
    }, this.def.transition.speed);

    this.setDot();

    if (this.def.autoHeight) {
      this.def.target.style.height =
        this.allSlides[this.curSlide].offsetHeight + "px";
    }

    this.def.afterChangeSlide(this);
  }

  initArrows() {
    if (this.def.arrowLeft != "") {
      this.def.arrowLeft.addEventListener(
        "click",
        () => {
          if (!hasClass(this.def.target, "isAnimating")) {
            if (this.curSlide == 1) {
              this.curSlide = this.totalSlides + 1;
              this.sliderInner.style.left = -this.curSlide * this.slideW + "px";
            }
            this.curSlide--;
            setTimeout(() => {
              this.gotoSlide();
            }, 0);
          }
        },
        false
      );
    }
    if (this.def.arrowRight != "") {
      this.def.arrowRight.addEventListener(
        "click",
        () => {
          if (!hasClass(this.def.target, "isAnimating")) {
            if (this.curSlide == this.totalSlides) {
              this.curSlide = 0;
              this.sliderInner.style.left = -this.curSlide * this.slideW + "px";
            }
            this.curSlide++;
            setTimeout(() => {
              this.gotoSlide();
            }, 0);
          }
        },
        false
      );
    }
  }

  setDot() {
    var tardot = this.curSlide - 1;
    for (var j = 0; j < this.totalSlides; j++) {
      removeClass(this.def.dotsWrapper.querySelectorAll("li")[j], "active");
    }
    if (this.curSlide - 1 < 0) {
      tardot = this.totalSlides - 1;
    } else if (this.curSlide - 1 > this.totalSlides - 1) {
      tardot = 0;
    }
    addClass(this.def.dotsWrapper.querySelectorAll("li")[tardot], "active");
  }

  updateSliderDimension() {
    this.slideW = parseInt(
      this.def.target.querySelectorAll(".slide")[0].offsetWidth
    );
    this.sliderInner.style.left = -this.slideW * this.curSlide + "px";
    if (this.def.autoHeight) {
      this.def.target.style.height =
        this.allSlides[this.curSlide].offsetHeight + "px";
    } else {
      for (var i = 0; i < this.totalSlides + 2; i++) {
        if (this.allSlides[i].offsetHeight > this.def.target.offsetHeight) {
          this.def.target.style.height = this.allSlides[i].offsetHeight + "px";
        }
      }
    }
    this.def.afterChangeSlide(this);
  }

  init() {
    window.addEventListener("resize", () => {
      setTimeout(this.updateSliderDimension, 100);
    });

    //insert last slide to first position and first to the last for the loop effect
    const cloneFirst = this.def.target
      .querySelectorAll(".slide")[0]
      .cloneNode(true);
    this.sliderInner.appendChild(cloneFirst);

    const cloneLast = this.def.target
      .querySelectorAll(".slide")
      [this.totalSlides - 1].cloneNode(true);
    this.sliderInner.insertBefore(cloneLast, this.sliderInner.firstChild);

    this.curSlide++;
    this.allSlides = this.def.target.querySelectorAll(".slide");

    this.sliderInner.style.width = (this.totalSlides + 2) * 100 + "%";

    for (let i = 0; i < this.totalSlides + 2; i++) {
      this.allSlides[i].style.width = 100 / (this.totalSlides + 2) + "%";
      this.loadedImg(this.allSlides[i]);
    }

    this.buildDots();
    this.setDot();
    this.initArrows();

    if (this.def.swipe) {
      this.sliderInner.addEventListener("mousedown", this.startSwipe);
      this.sliderInner.addEventListener("touchstart", this.startSwipe);
    }
    this.isAnimating = false;
  }
}

const slider = new Slider();
slider.init();
