function changeToSlug(e = "") {
  return (
    "@" +
    e
      .toLowerCase()
      .replace(
        /Ă¡|Ă |áº£|áº¡|Ă£|Äƒ|áº¯|áº±|áº³|áºµ|áº·|Ă¢|áº¥|áº§|áº©|áº«|áº­/gi,
        "a"
      )
      .replace(/Ă©|Ă¨|áº»|áº½|áº¹|Ăª|áº¿|á»|á»ƒ|á»…|á»‡/gi, "e")
      .replace(/i|Ă­|Ă¬|á»‰|Ä©|á»‹/gi, "i")
      .replace(
        /Ă³|Ă²|á»|Ăµ|á»|Ă´|á»‘|á»“|á»•|á»—|á»™|Æ¡|á»›|á»|á»Ÿ|á»¡|á»£/gi,
        "o"
      )
      .replace(/Ăº|Ă¹|á»§|Å©|á»¥|Æ°|á»©|á»«|á»­|á»¯|á»±/gi, "u")
      .replace(/Ă½|á»³|á»·|á»¹|á»µ/gi, "y")
      .replace(/Ä‘/gi, "d")
      .replace(
        /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
        ""
      )
      .replace(/ /gi, "-")
      .replace(/\-\-\-\-\-/gi, "-")
      .replace(/\-\-\-\-/gi, "-")
      .replace(/\-\-\-/gi, "-")
      .replace(/\-\-/gi, "-") +
    "@"
  ).replace(/\@\-|\-\@|\@/gi, "");
}
!(function (e) {
  "use strict";
  var t = function (t) {
      return this.each(function () {
        var n,
          i,
          a = e(this),
          c = a.data(),
          r = [a],
          o = this.tagName,
          l = 0;
        (n = e.extend(
          { content: "body", headings: "h1,h2,h3" },
          { content: c.toc || void 0, headings: c.tocHeadings || void 0 },
          t
        )),
          (i = n.headings.split(",")),
          e(n.content)
            .find(n.headings)
            .attr("id", function (t, n) {
              return (
                n ||
                (function (e) {
                  0 === e.length && (e = "?");
                  for (
                    var t = changeToSlug(e), n = "", i = 1;
                    null !== document.getElementById(t + n);

                  )
                    n = "_" + i++;
                  return t + n;
                })(e(this).text())
              );
            })
            .each(function () {
              var t = e(this),
                n = e.map(i, function (e, n) {
                  return t.is(e) ? n : void 0;
                })[0];
              if (n > l) {
                var a = r[0].children("li:last")[0];
                a && r.unshift(e("<" + o + "/>").appendTo(a));
              } else r.splice(0, Math.min(l - n, Math.max(r.length - 1, 0)));
              e("<li/>")
                .appendTo(r[0])
                .append(
                  e("<a/>")
                    .text(t.text())
                    .attr("data-rel", "#" + t.attr("id"))
                ),
                (l = n);
            });
      });
    },
    n = e.fn.toc;
  (e.fn.toc = t),
    (e.fn.toc.noConflict = function () {
      return (e.fn.toc = n), this;
    }),
    e(function () {
      t.call(e("[data-toc]"));
    });
})(window.jQuery);
