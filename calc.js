window.onload = function() {
  var screen,
      output,
      limit,
      isNewOperation = true;

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

  function replaceAll(haystack, needle, replace) {
    return haystack.split(needle).join(replace);
}

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
}

function strContain(haystack, needle) {
    return haystack.indexOf(needle) > -1;
}

function isParseable(n, minus) {
    return (!isNaN(n) || (n == "-" && !minus) || n == ".");
}

function getSide(haystack, middle, direction, minus) {
    var i = middle + direction;
    var term = "";
    var limit = (direction == -1) ? 0 : haystack.length;
    while (i * direction <= limit) {
        if (isParseable(haystack[i], minus)) {
            if (direction == 1) term = term + haystack[i];
            else term = haystack[i] + term;
            i += direction;
        } else { return term; }
    }
    return term;
}

function allocFx(eq, symbol, alloc, minus) {
    minus = (typeof minus !== 'undefined');
    if (strContain(eq, symbol)) {
        var middleIndex = eq.indexOf(symbol);
        var left = getSide(eq, middleIndex, -1, minus);
        var right = getSide(eq, middleIndex, 1, false);
        eq = replaceAll(eq, left + symbol + right, alloc(left, right));
    }
    return eq;
}

function solveStr(eq) {
    firstNest:
    while (strContain(eq, "(")) {
        var first = eq.indexOf("(");
        var last = first + 1;
        var layer = 1;
        while (layer != 0) {
            if (eq[last] == ")") {
                layer--;
                if (layer == 0) break;
            }
            else if (eq[last] == "(") {
                layer++;
            }
            last++;
            if (last > eq.length) break firstNest;
        }

        var nested = eq.substr(first + 1, last - first - 1);
        if (last + 1 <= eq.length) {
            if (eq[last + 1] == "^") {
                eq = eq.substr(0, last + 1) + "&" + eq.substr((last+1)+1);
            }
        }

        var solvedStr = solveStr(nested);
        var preStr = "(" + nested + ")";
        eq = eq.replace(preStr, solvedStr);
    }
    // while (strContain(eq, "^")) eq = allocFx(eq, "^", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); }, false);
    // while (strContain(eq, "&")) eq = allocFx(eq, "&", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); });
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
