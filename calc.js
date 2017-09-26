window.onload = function() {
  var current,
      screen,
      output,
      limit,
      zero,
      period,
      isNewOperation = true,
      operator;

  screen = document.getElementById("result");
  var elem = document.querySelectorAll(".num");
  var len = elem.length;
    for(var i = 0; i < len; i++ ) {
      elem[i].addEventListener("click",function() {
        if (isNewOperation) {
          isNewOperation = false;
          screen.innerHTML = output = '';
        }
        num = this.value;
        output = screen.innerHTML += num;
        limit = output.length;
       if(limit > 14 ) {
         alert("Sorry no more input is allowed");
       }
     },false);
  }

  // document.querySelector(".zero").addEventListener("click",function() {
  //   zero = this.value;
  //   if(screen.innerHTML === "") {
  //     output = screen.innerHTML = zero;
  //   }else if(screen.innerHTML === output) {
  //     output = screen.innerHTML +=zero;
  //   }
  // },false);

  // document.querySelector(".period").addEventListener("click",function() {
  //   period = this.value;
  //   if(screen.innerHTML === "") {
  //     output = screen.innerHTML = screen.innerHTML.concat("0.");
  //   }else if(screen.innerHTML === output) {
  //     screen.innerHTML = screen.innerHTML.concat(".");
  //   }
  // },false);

  document.querySelector("#eqn-bg").addEventListener("click",function() {
    isNewOperation = true;
    if(screen.innerHTML === output) {
      solveStr(screen.innerHTML);
    }else {
      screen.innerHTML = "";
    }
  },false);

 document.querySelector("#delete").addEventListener("click",function() {
   screen.innerHTML = "";
  },false);

  // var elem1 = document.querySelectorAll(".operator");
  //
  // var len1 = elem1.length;
  // for(var i = 0; i < len1; i++ ) {
  //   elem1[i].addEventListener("click",function() {
  //     operator = this.value;
  //     if(screen.innerHTML === "") {
  //       screen.innerHTML = screen.innerHTML.concat("");
  //     }else if(output) {
  //       screen.innerHTML = output.concat(operator);
  //     }
  //   },false);
  // }

  function replaceAll(haystack, needle, replace) {
    return haystack.split(needle).join(replace);
} // replace all fx

function reformat(s) {
    s = s.toLowerCase();
    s = replaceAll(s, "-(", "-1*(");
    s = replaceAll(s, ")(", ")*(");
    s = replaceAll(s, " ", "");
    s = replaceAll(s, "-", "+-");
    s = replaceAll(s, "--", "+");
    s = replaceAll(s, "++", "+");
    s = replaceAll(s, "(+", "(");
    for (var i = 0; i < 10; i++) {
        s = replaceAll(s, i + "(", i + "*" + "(");
    }
    while(s.charAt(0) == "+") s = s.substr(1);
    return s;
} // standardize string format

function strContain(haystack, needle) {
    return haystack.indexOf(needle) > -1;
} // custom true/false contains

function isParseable(n, minus) {
    return (!isNaN(n) || (n == "-" && !minus) || n == ".");
} // determine if char should be added to side

function getSide(haystack, middle, direction, minus) {
    var i = middle + direction;
    var term = "";
    var limit = (direction == -1) ? 0 : haystack.length; // set the stopping point, when you have gone too far
    while (i * direction <= limit) { // while the current position is >= 0, or <= upper limit
        if (isParseable(haystack[i], minus)) {
            if (direction == 1) term = term + haystack[i];
            else term = haystack[i] + term;
            i += direction;
        } else { return term; }
    }
    return term;
} // general fx to get two terms of any fx (multiply, add, etc)

function allocFx(eq, symbol, alloc, minus) {
    minus = (typeof minus !== 'undefined'); // sometimes we want to capture minus signs, sometimes not
    if (strContain(eq, symbol)) {
        var middleIndex = eq.indexOf(symbol);
        var left = getSide(eq, middleIndex, -1, minus);
        var right = getSide(eq, middleIndex, 1, false);
        eq = replaceAll(eq, left+symbol+right, alloc(left, right));
    }
    return eq;
} // fx to generically map a symbol to a function for parsing

function solveStr(eq) {
    firstNest:
    while (strContain(eq, "(")) { // while the string has any parentheses
        var first = eq.indexOf("("); // first get the earliest open parentheses
        var last = first + 1; // start searching at the character after
        var layer = 1; // we might run into more parentheses, so this integer will keep track
        while (layer != 0) { // loop this until we've found the close parenthesis
            if (eq[last] == ")") { // if we run into a close parenthesis, then subtract one from "layer"
                layer--;
                if (layer == 0) break; // if it is the corresponding closing parenthesis for our outermost open parenthesis, then we can deal with this expression
            }
            else if (eq[last] == "(") { // if we see an open parenthesis, add one to "layer"
                layer++;
            }
            last++; // increment the character we're looking at
            if (last > eq.length) break firstNest;
        }

        var nested = eq.substr(first + 1, last - first - 1); // get the expression between the parentheses

        if (last + 1 <= eq.length) { // if there is exponentiation, change to a different symbol
            if (eq[last + 1] == "^") {
                eq = eq.substr(0, last + 1) + "&" + eq.substr((last+1)+1);
            }
        }

        var solvedStr = solveStr(nested);
        var preStr = "(" + nested + ")";
        eq = eq.replace(preStr, solvedStr); // replace parenthetical with value
    }
    while (strContain(eq, "^")) eq = allocFx(eq, "^", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); }, false);
    while (strContain(eq, "&")) eq = allocFx(eq, "&", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); }); // account for things like (-3)^2
    while (strContain(eq, "*") || strContain(eq, "/")) {
        var multiply = true;
        if (eq.indexOf("*") < eq.indexOf("/")) {
            multiply = (strContain(eq, "*"));
        } else {
            multiply = !(strContain(eq, "/"));
        }
        eq = (multiply) ? allocFx(eq, "*", function(l, r) { return parseFloat(l)*parseFloat(r); }) : allocFx(eq, "/", function(l, r) { return parseFloat(l)/parseFloat(r); });
    }
    while (strContain(eq, "+")) eq = allocFx(eq, "+", function(l, r) { return parseFloat(l)+parseFloat(r); });
    screen.innerHTML = eq;
    return eq;
}
}
