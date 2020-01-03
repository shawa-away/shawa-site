export function $(elem) {
  return document.querySelector(elem);
}

export function hasClass(el, className) {
  return el.classList
    ? el.classList.contains(className)
    : new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
}

export function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += " " + className;
  }
}

export function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
}

export function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  }
}

export function removeListenerMulti(el, s, fn) {
  s.split(" ").forEach(function(e) {
    return el.removeEventListener(e, fn, false);
  });
}

export function addListenerMulti(el, s, fn) {
  s.split(" ").forEach(function(e) {
    return el.addEventListener(e, fn, false);
  });
}
