!(function (h, i, n, a) {
  function l(t, e) {
    (this.settings = null),
      (this.options = h.extend({}, l.Defaults, e)),
      (this.$element = h(t)),
      (this._handlers = {}),
      (this._plugins = {}),
      (this._supress = {}),
      (this._current = null),
      (this._speed = null),
      (this._coordinates = []),
      (this._breakpoint = null),
      (this._width = null),
      (this._items = []),
      (this._clones = []),
      (this._mergers = []),
      (this._widths = []),
      (this._invalidated = {}),
      (this._pipe = []),
      (this._drag = {
        time: null,
        target: null,
        pointer: null,
        stage: { start: null, current: null },
        direction: null,
      }),
      (this._states = {
        current: {},
        tags: {
          initializing: ["busy"],
          animating: ["busy"],
          dragging: ["interacting"],
        },
      }),
      h.each(
        ["onResize", "onThrottledResize"],
        h.proxy(function (t, e) {
          this._handlers[e] = h.proxy(this[e], this);
        }, this)
      ),
      h.each(
        l.Plugins,
        h.proxy(function (t, e) {
          this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this);
        }, this)
      ),
      h.each(
        l.Workers,
        h.proxy(function (t, e) {
          this._pipe.push({ filter: e.filter, run: h.proxy(e.run, this) });
        }, this)
      ),
      this.setup(),
      this.initialize();
  }
  (l.Defaults = {
    items: 3,
    loop: !1,
    center: !1,
    rewind: !1,
    checkVisibility: !0,
    mouseDrag: !0,
    touchDrag: !0,
    pullDrag: !0,
    freeDrag: !1,
    margin: 0,
    stagePadding: 0,
    merge: !1,
    mergeFit: !0,
    autoWidth: !1,
    startPosition: 0,
    rtl: !1,
    smartSpeed: 250,
    fluidSpeed: !1,
    dragEndSpeed: !1,
    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: i,
    fallbackEasing: "swing",
    slideTransition: "",
    info: !1,
    nestedItemSelector: !1,
    itemElement: "div",
    stageElement: "div",
    refreshClass: "owl-refresh",
    loadedClass: "owl-loaded",
    loadingClass: "owl-loading",
    rtlClass: "owl-rtl",
    responsiveClass: "owl-responsive",
    dragClass: "owl-drag",
    itemClass: "owl-item",
    stageClass: "owl-stage",
    stageOuterClass: "owl-stage-outer",
    grabClass: "owl-grab",
  }),
    (l.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
    (l.Type = { Event: "event", State: "state" }),
    (l.Plugins = {}),
    (l.Workers = [
      {
        filter: ["width", "settings"],
        run: function () {
          this._width = this.$element.width();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (t) {
          t.current = this._items && this._items[this.relative(this._current)];
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          this.$stage.children(".cloned").remove();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (t) {
          var e = this.settings.margin || "",
            i = !this.settings.autoWidth,
            s = this.settings.rtl,
            n = {
              width: "auto",
              "margin-left": s ? e : "",
              "margin-right": s ? "" : e,
            };
          !i && this.$stage.children().css(n), (t.css = n);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (t) {
          var e =
              (this.width() / this.settings.items).toFixed(3) -
              this.settings.margin,
            i = null,
            s = this._items.length,
            n = !this.settings.autoWidth,
            o = [];
          for (t.items = { merge: !1, width: e }; s--; )
            (i = this._mergers[s]),
              (i =
                (this.settings.mergeFit && Math.min(i, this.settings.items)) ||
                i),
              (t.items.merge = 1 < i || t.items.merge),
              (o[s] = n ? e * i : this._items[s].width());
          this._widths = o;
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          var t = [],
            e = this._items,
            i = this.settings,
            s = Math.max(2 * i.items, 4),
            n = 2 * Math.ceil(e.length / 2),
            o = i.loop && e.length ? (i.rewind ? s : Math.max(s, n)) : 0,
            r = "",
            a = "";
          for (o /= 2; 0 < o; )
            t.push(this.normalize(t.length / 2, !0)),
              (r += e[t[t.length - 1]][0].outerHTML),
              t.push(this.normalize(e.length - 1 - (t.length - 1) / 2, !0)),
              (a = e[t[t.length - 1]][0].outerHTML + a),
              (o -= 1);
          (this._clones = t),
            h(r).addClass("cloned").appendTo(this.$stage),
            h(a).addClass("cloned").prependTo(this.$stage);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          for (
            var t = this.settings.rtl ? 1 : -1,
              e = this._clones.length + this._items.length,
              i = -1,
              s = 0,
              n = 0,
              o = [];
            ++i < e;

          )
            (s = o[i - 1] || 0),
              (n = this._widths[this.relative(i)] + this.settings.margin),
              o.push(s + n * t);
          this._coordinates = o;
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          var t = this.settings.stagePadding,
            e = this._coordinates,
            i = {
              width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t,
              "padding-left": t || "",
              "padding-right": t || "",
            };
          this.$stage.css(i);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (t) {
          var e = this._coordinates.length,
            i = !this.settings.autoWidth,
            s = this.$stage.children();
          if (i && t.items.merge)
            for (; e--; )
              (t.css.width = this._widths[this.relative(e)]),
                s.eq(e).css(t.css);
          else i && ((t.css.width = t.items.width), s.css(t.css));
        },
      },
      {
        filter: ["items"],
        run: function () {
          this._coordinates.length < 1 && this.$stage.removeAttr("style");
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (t) {
          (t.current = t.current ? this.$stage.children().index(t.current) : 0),
            (t.current = Math.max(
              this.minimum(),
              Math.min(this.maximum(), t.current)
            )),
            this.reset(t.current);
        },
      },
      {
        filter: ["position"],
        run: function () {
          this.animate(this.coordinates(this._current));
        },
      },
      {
        filter: ["width", "position", "items", "settings"],
        run: function () {
          var t,
            e,
            i,
            s,
            n = this.settings.rtl ? 1 : -1,
            o = 2 * this.settings.stagePadding,
            r = this.coordinates(this.current()) + o,
            a = r + this.width() * n,
            h = [];
          for (i = 0, s = this._coordinates.length; i < s; i++)
            (t = this._coordinates[i - 1] || 0),
              (e = Math.abs(this._coordinates[i]) + o * n),
              ((this.op(t, "<=", r) && this.op(t, ">", a)) ||
                (this.op(e, "<", r) && this.op(e, ">", a))) &&
                h.push(i);
          this.$stage.children(".active").removeClass("active"),
            this.$stage
              .children(":eq(" + h.join("), :eq(") + ")")
              .addClass("active"),
            this.$stage.children(".center").removeClass("center"),
            this.settings.center &&
              this.$stage.children().eq(this.current()).addClass("center");
        },
      },
    ]),
    (l.prototype.initializeStage = function () {
      (this.$stage = this.$element.find("." + this.settings.stageClass)),
        this.$stage.length ||
          (this.$element.addClass(this.options.loadingClass),
          (this.$stage = h("<" + this.settings.stageElement + ">", {
            class: this.settings.stageClass,
          }).wrap(h("<div/>", { class: this.settings.stageOuterClass }))),
          this.$element.append(this.$stage.parent()));
    }),
    (l.prototype.initializeItems = function () {
      var t = this.$element.find(".owl-item");
      if (t.length)
        return (
          (this._items = t.get().map(function (t) {
            return h(t);
          })),
          (this._mergers = this._items.map(function () {
            return 1;
          })),
          void this.refresh()
        );
      this.replace(this.$element.children().not(this.$stage.parent())),
        this.isVisible() ? this.refresh() : this.invalidate("width"),
        this.$element
          .removeClass(this.options.loadingClass)
          .addClass(this.options.loadedClass);
    }),
    (l.prototype.initialize = function () {
      var t, e, i;
      this.enter("initializing"),
        this.trigger("initialize"),
        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
        this.settings.autoWidth &&
          !this.is("pre-loading") &&
          ((t = this.$element.find("img")),
          (e = this.settings.nestedItemSelector
            ? "." + this.settings.nestedItemSelector
            : a),
          (i = this.$element.children(e).width()),
          t.length && i <= 0 && this.preloadAutoWidthImages(t)),
        this.initializeStage(),
        this.initializeItems(),
        this.registerEventHandlers(),
        this.leave("initializing"),
        this.trigger("initialized");
    }),
    (l.prototype.isVisible = function () {
      return !this.settings.checkVisibility || this.$element.is(":visible");
    }),
    (l.prototype.setup = function () {
      var e = this.viewport(),
        t = this.options.responsive,
        i = -1,
        s = null;
      t
        ? (h.each(t, function (t) {
            t <= e && i < t && (i = Number(t));
          }),
          "function" ==
            typeof (s = h.extend({}, this.options, t[i])).stagePadding &&
            (s.stagePadding = s.stagePadding()),
          delete s.responsive,
          s.responsiveClass &&
            this.$element.attr(
              "class",
              this.$element
                .attr("class")
                .replace(
                  new RegExp(
                    "(" + this.options.responsiveClass + "-)\\S+\\s",
                    "g"
                  ),
                  "$1" + i
                )
            ))
        : (s = h.extend({}, this.options)),
        this.trigger("change", { property: { name: "settings", value: s } }),
        (this._breakpoint = i),
        (this.settings = s),
        this.invalidate("settings"),
        this.trigger("changed", {
          property: { name: "settings", value: this.settings },
        });
    }),
    (l.prototype.optionsLogic = function () {
      this.settings.autoWidth &&
        ((this.settings.stagePadding = !1), (this.settings.merge = !1));
    }),
    (l.prototype.prepare = function (t) {
      var e = this.trigger("prepare", { content: t });
      return (
        e.data ||
          (e.data = h("<" + this.settings.itemElement + "/>")
            .addClass(this.options.itemClass)
            .append(t)),
        this.trigger("prepared", { content: e.data }),
        e.data
      );
    }),
    (l.prototype.update = function () {
      for (
        var t = 0,
          e = this._pipe.length,
          i = h.proxy(function (t) {
            return this[t];
          }, this._invalidated),
          s = {};
        t < e;

      )
        (this._invalidated.all || 0 < h.grep(this._pipe[t].filter, i).length) &&
          this._pipe[t].run(s),
          t++;
      (this._invalidated = {}), !this.is("valid") && this.enter("valid");
    }),
    (l.prototype.width = function (t) {
      switch ((t = t || l.Width.Default)) {
        case l.Width.Inner:
        case l.Width.Outer:
          return this._width;
        default:
          return (
            this._width - 2 * this.settings.stagePadding + this.settings.margin
          );
      }
    }),
    (l.prototype.refresh = function () {
      this.enter("refreshing"),
        this.trigger("refresh"),
        this.setup(),
        this.optionsLogic(),
        this.$element.addClass(this.options.refreshClass),
        this.update(),
        this.$element.removeClass(this.options.refreshClass),
        this.leave("refreshing"),
        this.trigger("refreshed");
    }),
    (l.prototype.onThrottledResize = function () {
      i.clearTimeout(this.resizeTimer),
        (this.resizeTimer = i.setTimeout(
          this._handlers.onResize,
          this.settings.responsiveRefreshRate
        ));
    }),
    (l.prototype.onResize = function () {
      return (
        !!this._items.length &&
        this._width !== this.$element.width() &&
        !!this.isVisible() &&
        (this.enter("resizing"),
        this.trigger("resize").isDefaultPrevented()
          ? (this.leave("resizing"), !1)
          : (this.invalidate("width"),
            this.refresh(),
            this.leave("resizing"),
            void this.trigger("resized")))
      );
    }),
    (l.prototype.registerEventHandlers = function () {
      h.support.transition &&
        this.$stage.on(
          h.support.transition.end + ".owl.core",
          h.proxy(this.onTransitionEnd, this)
        ),
        !1 !== this.settings.responsive &&
          this.on(i, "resize", this._handlers.onThrottledResize),
        this.settings.mouseDrag &&
          (this.$element.addClass(this.options.dragClass),
          this.$stage.on("mousedown.owl.core", h.proxy(this.onDragStart, this)),
          this.$stage.on(
            "dragstart.owl.core selectstart.owl.core",
            function () {
              return !1;
            }
          )),
        this.settings.touchDrag &&
          (this.$stage.on(
            "touchstart.owl.core",
            h.proxy(this.onDragStart, this)
          ),
          this.$stage.on(
            "touchcancel.owl.core",
            h.proxy(this.onDragEnd, this)
          ));
    }),
    (l.prototype.onDragStart = function (t) {
      var e = null;
      3 !== t.which &&
        ((e = h.support.transform
          ? {
              x: (e = this.$stage
                .css("transform")
                .replace(/.*\(|\)| /g, "")
                .split(","))[16 === e.length ? 12 : 4],
              y: e[16 === e.length ? 13 : 5],
            }
          : ((e = this.$stage.position()),
            {
              x: this.settings.rtl
                ? e.left +
                  this.$stage.width() -
                  this.width() +
                  this.settings.margin
                : e.left,
              y: e.top,
            })),
        this.is("animating") &&
          (h.support.transform ? this.animate(e.x) : this.$stage.stop(),
          this.invalidate("position")),
        this.$element.toggleClass(
          this.options.grabClass,
          "mousedown" === t.type
        ),
        this.speed(0),
        (this._drag.time = new Date().getTime()),
        (this._drag.target = h(t.target)),
        (this._drag.stage.start = e),
        (this._drag.stage.current = e),
        (this._drag.pointer = this.pointer(t)),
        h(n).on(
          "mouseup.owl.core touchend.owl.core",
          h.proxy(this.onDragEnd, this)
        ),
        h(n).one(
          "mousemove.owl.core touchmove.owl.core",
          h.proxy(function (t) {
            var e = this.difference(this._drag.pointer, this.pointer(t));
            h(n).on(
              "mousemove.owl.core touchmove.owl.core",
              h.proxy(this.onDragMove, this)
            ),
              (Math.abs(e.x) < Math.abs(e.y) && this.is("valid")) ||
                (t.preventDefault(),
                this.enter("dragging"),
                this.trigger("drag"));
          }, this)
        ));
    }),
    (l.prototype.onDragMove = function (t) {
      var e = null,
        i = null,
        s = null,
        n = this.difference(this._drag.pointer, this.pointer(t)),
        o = this.difference(this._drag.stage.start, n);
      this.is("dragging") &&
        (t.preventDefault(),
        this.settings.loop
          ? ((e = this.coordinates(this.minimum())),
            (i = this.coordinates(this.maximum() + 1) - e),
            (o.x = ((((o.x - e) % i) + i) % i) + e))
          : ((e = this.settings.rtl
              ? this.coordinates(this.maximum())
              : this.coordinates(this.minimum())),
            (i = this.settings.rtl
              ? this.coordinates(this.minimum())
              : this.coordinates(this.maximum())),
            (s = this.settings.pullDrag ? (-1 * n.x) / 5 : 0),
            (o.x = Math.max(Math.min(o.x, e + s), i + s))),
        (this._drag.stage.current = o),
        this.animate(o.x));
    }),
    (l.prototype.onDragEnd = function (t) {
      var e = this.difference(this._drag.pointer, this.pointer(t)),
        i = this._drag.stage.current,
        s = (0 < e.x) ^ this.settings.rtl ? "left" : "right";
      h(n).off(".owl.core"),
        this.$element.removeClass(this.options.grabClass),
        ((0 !== e.x && this.is("dragging")) || !this.is("valid")) &&
          (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
          this.current(this.closest(i.x, 0 !== e.x ? s : this._drag.direction)),
          this.invalidate("position"),
          this.update(),
          (this._drag.direction = s),
          (3 < Math.abs(e.x) || 300 < new Date().getTime() - this._drag.time) &&
            this._drag.target.one("click.owl.core", function () {
              return !1;
            })),
        this.is("dragging") &&
          (this.leave("dragging"), this.trigger("dragged"));
    }),
    (l.prototype.closest = function (i, s) {
      var n = -1,
        o = this.width(),
        r = this.coordinates();
      return (
        this.settings.freeDrag ||
          h.each(
            r,
            h.proxy(function (t, e) {
              return (
                "left" === s && e - 30 < i && i < e + 30
                  ? (n = t)
                  : "right" === s && e - o - 30 < i && i < e - o + 30
                  ? (n = t + 1)
                  : this.op(i, "<", e) &&
                    this.op(i, ">", r[t + 1] !== a ? r[t + 1] : e - o) &&
                    (n = "left" === s ? t + 1 : t),
                -1 === n
              );
            }, this)
          ),
        this.settings.loop ||
          (this.op(i, ">", r[this.minimum()])
            ? (n = i = this.minimum())
            : this.op(i, "<", r[this.maximum()]) && (n = i = this.maximum())),
        n
      );
    }),
    (l.prototype.animate = function (t) {
      var e = 0 < this.speed();
      this.is("animating") && this.onTransitionEnd(),
        e && (this.enter("animating"), this.trigger("translate")),
        h.support.transform3d && h.support.transition
          ? this.$stage.css({
              transform: "translate3d(" + t + "px,0px,0px)",
              transition:
                this.speed() / 1e3 +
                "s" +
                (this.settings.slideTransition
                  ? " " + this.settings.slideTransition
                  : ""),
            })
          : e
          ? this.$stage.animate(
              { left: t + "px" },
              this.speed(),
              this.settings.fallbackEasing,
              h.proxy(this.onTransitionEnd, this)
            )
          : this.$stage.css({ left: t + "px" });
    }),
    (l.prototype.is = function (t) {
      return this._states.current[t] && 0 < this._states.current[t];
    }),
    (l.prototype.current = function (t) {
      if (t === a) return this._current;
      if (0 === this._items.length) return a;
      if (((t = this.normalize(t)), this._current !== t)) {
        var e = this.trigger("change", {
          property: { name: "position", value: t },
        });
        e.data !== a && (t = this.normalize(e.data)),
          (this._current = t),
          this.invalidate("position"),
          this.trigger("changed", {
            property: { name: "position", value: this._current },
          });
      }
      return this._current;
    }),
    (l.prototype.invalidate = function (t) {
      return (
        "string" === h.type(t) &&
          ((this._invalidated[t] = !0),
          this.is("valid") && this.leave("valid")),
        h.map(this._invalidated, function (t, e) {
          return e;
        })
      );
    }),
    (l.prototype.reset = function (t) {
      (t = this.normalize(t)) !== a &&
        ((this._speed = 0),
        (this._current = t),
        this.suppress(["translate", "translated"]),
        this.animate(this.coordinates(t)),
        this.release(["translate", "translated"]));
    }),
    (l.prototype.normalize = function (t, e) {
      var i = this._items.length,
        s = e ? 0 : this._clones.length;
      return (
        !this.isNumeric(t) || i < 1
          ? (t = a)
          : (t < 0 || i + s <= t) &&
            (t = ((((t - s / 2) % i) + i) % i) + s / 2),
        t
      );
    }),
    (l.prototype.relative = function (t) {
      return (t -= this._clones.length / 2), this.normalize(t, !0);
    }),
    (l.prototype.maximum = function (t) {
      var e,
        i,
        s,
        n = this.settings,
        o = this._coordinates.length;
      if (n.loop) o = this._clones.length / 2 + this._items.length - 1;
      else if (n.autoWidth || n.merge) {
        if ((e = this._items.length))
          for (
            i = this._items[--e].width(), s = this.$element.width();
            e-- && !(s < (i += this._items[e].width() + this.settings.margin));

          );
        o = e + 1;
      } else
        o = n.center ? this._items.length - 1 : this._items.length - n.items;
      return t && (o -= this._clones.length / 2), Math.max(o, 0);
    }),
    (l.prototype.minimum = function (t) {
      return t ? 0 : this._clones.length / 2;
    }),
    (l.prototype.items = function (t) {
      return t === a
        ? this._items.slice()
        : ((t = this.normalize(t, !0)), this._items[t]);
    }),
    (l.prototype.mergers = function (t) {
      return t === a
        ? this._mergers.slice()
        : ((t = this.normalize(t, !0)), this._mergers[t]);
    }),
    (l.prototype.clones = function (i) {
      var e = this._clones.length / 2,
        s = e + this._items.length,
        n = function (t) {
          return t % 2 == 0 ? s + t / 2 : e - (t + 1) / 2;
        };
      return i === a
        ? h.map(this._clones, function (t, e) {
            return n(e);
          })
        : h.map(this._clones, function (t, e) {
            return t === i ? n(e) : null;
          });
    }),
    (l.prototype.speed = function (t) {
      return t !== a && (this._speed = t), this._speed;
    }),
    (l.prototype.coordinates = function (t) {
      var e,
        i = 1,
        s = t - 1;
      return t === a
        ? h.map(
            this._coordinates,
            h.proxy(function (t, e) {
              return this.coordinates(e);
            }, this)
          )
        : (this.settings.center
            ? (this.settings.rtl && ((i = -1), (s = t + 1)),
              (e = this._coordinates[t]),
              (e += ((this.width() - e + (this._coordinates[s] || 0)) / 2) * i))
            : (e = this._coordinates[s] || 0),
          (e = Math.ceil(e)));
    }),
    (l.prototype.duration = function (t, e, i) {
      return 0 === i
        ? 0
        : Math.min(Math.max(Math.abs(e - t), 1), 6) *
            Math.abs(i || this.settings.smartSpeed);
    }),
    (l.prototype.to = function (t, e) {
      var i = this.current(),
        s = null,
        n = t - this.relative(i),
        o = (0 < n) - (n < 0),
        r = this._items.length,
        a = this.minimum(),
        h = this.maximum();
      this.settings.loop
        ? (!this.settings.rewind && Math.abs(n) > r / 2 && (n += -1 * o * r),
          (s = (((((t = i + n) - a) % r) + r) % r) + a) !== t &&
            s - n <= h &&
            0 < s - n &&
            ((i = s - n), (t = s), this.reset(i)))
        : (t = this.settings.rewind
            ? ((t % (h += 1)) + h) % h
            : Math.max(a, Math.min(h, t))),
        this.speed(this.duration(i, t, e)),
        this.current(t),
        this.isVisible() && this.update();
    }),
    (l.prototype.next = function (t) {
      (t = t || !1), this.to(this.relative(this.current()) + 1, t);
    }),
    (l.prototype.prev = function (t) {
      (t = t || !1), this.to(this.relative(this.current()) - 1, t);
    }),
    (l.prototype.onTransitionEnd = function (t) {
      if (
        t !== a &&
        (t.stopPropagation(),
        (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))
      )
        return !1;
      this.leave("animating"), this.trigger("translated");
    }),
    (l.prototype.viewport = function () {
      var t;
      return (
        this.options.responsiveBaseElement !== i
          ? (t = h(this.options.responsiveBaseElement).width())
          : i.innerWidth
          ? (t = i.innerWidth)
          : n.documentElement && n.documentElement.clientWidth
          ? (t = n.documentElement.clientWidth)
          : console.warn("Can not detect viewport width."),
        t
      );
    }),
    (l.prototype.replace = function (t) {
      this.$stage.empty(),
        (this._items = []),
        t && (t = t instanceof jQuery ? t : h(t)),
        this.settings.nestedItemSelector &&
          (t = t.find("." + this.settings.nestedItemSelector)),
        t
          .filter(function () {
            return 1 === this.nodeType;
          })
          .each(
            h.proxy(function (t, e) {
              (e = this.prepare(e)),
                this.$stage.append(e),
                this._items.push(e),
                this._mergers.push(
                  1 *
                    e
                      .find("[data-merge]")
                      .addBack("[data-merge]")
                      .attr("data-merge") || 1
                );
            }, this)
          ),
        this.reset(
          this.isNumeric(this.settings.startPosition)
            ? this.settings.startPosition
            : 0
        ),
        this.invalidate("items");
    }),
    (l.prototype.add = function (t, e) {
      var i = this.relative(this._current);
      (e = e === a ? this._items.length : this.normalize(e, !0)),
        (t = t instanceof jQuery ? t : h(t)),
        this.trigger("add", { content: t, position: e }),
        (t = this.prepare(t)),
        0 === this._items.length || e === this._items.length
          ? (0 === this._items.length && this.$stage.append(t),
            0 !== this._items.length && this._items[e - 1].after(t),
            this._items.push(t),
            this._mergers.push(
              1 *
                t
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            ))
          : (this._items[e].before(t),
            this._items.splice(e, 0, t),
            this._mergers.splice(
              e,
              0,
              1 *
                t
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            )),
        this._items[i] && this.reset(this._items[i].index()),
        this.invalidate("items"),
        this.trigger("added", { content: t, position: e });
    }),
    (l.prototype.remove = function (t) {
      (t = this.normalize(t, !0)) !== a &&
        (this.trigger("remove", { content: this._items[t], position: t }),
        this._items[t].remove(),
        this._items.splice(t, 1),
        this._mergers.splice(t, 1),
        this.invalidate("items"),
        this.trigger("removed", { content: null, position: t }));
    }),
    (l.prototype.preloadAutoWidthImages = function (t) {
      t.each(
        h.proxy(function (t, e) {
          this.enter("pre-loading"),
            (e = h(e)),
            h(new Image())
              .one(
                "load",
                h.proxy(function (t) {
                  e.attr("src", t.target.src),
                    e.css("opacity", 1),
                    this.leave("pre-loading"),
                    !this.is("pre-loading") &&
                      !this.is("initializing") &&
                      this.refresh();
                }, this)
              )
              .attr(
                "src",
                e.attr("src") || e.attr("data-src") || e.attr("data-src-retina")
              );
        }, this)
      );
    }),
    (l.prototype.destroy = function () {
      for (var t in (this.$element.off(".owl.core"),
      this.$stage.off(".owl.core"),
      h(n).off(".owl.core"),
      !1 !== this.settings.responsive &&
        (i.clearTimeout(this.resizeTimer),
        this.off(i, "resize", this._handlers.onThrottledResize)),
      this._plugins))
        this._plugins[t].destroy();
      this.$stage.children(".cloned").remove(),
        this.$stage.unwrap(),
        this.$stage.children().contents().unwrap(),
        this.$stage.children().unwrap(),
        this.$stage.remove(),
        this.$element
          .removeClass(this.options.refreshClass)
          .removeClass(this.options.loadingClass)
          .removeClass(this.options.loadedClass)
          .removeClass(this.options.rtlClass)
          .removeClass(this.options.dragClass)
          .removeClass(this.options.grabClass)
          .attr(
            "class",
            this.$element
              .attr("class")
              .replace(
                new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
                ""
              )
          )
          .removeData("owl.carousel");
    }),
    (l.prototype.op = function (t, e, i) {
      var s = this.settings.rtl;
      switch (e) {
        case "<":
          return s ? i < t : t < i;
        case ">":
          return s ? t < i : i < t;
        case ">=":
          return s ? t <= i : i <= t;
        case "<=":
          return s ? i <= t : t <= i;
      }
    }),
    (l.prototype.on = function (t, e, i, s) {
      t.addEventListener
        ? t.addEventListener(e, i, s)
        : t.attachEvent && t.attachEvent("on" + e, i);
    }),
    (l.prototype.off = function (t, e, i, s) {
      t.removeEventListener
        ? t.removeEventListener(e, i, s)
        : t.detachEvent && t.detachEvent("on" + e, i);
    }),
    (l.prototype.trigger = function (t, e, i, s, n) {
      var o = { item: { count: this._items.length, index: this.current() } },
        r = h.camelCase(
          h
            .grep(["on", t, i], function (t) {
              return t;
            })
            .join("-")
            .toLowerCase()
        ),
        a = h.Event(
          [t, "owl", i || "carousel"].join(".").toLowerCase(),
          h.extend({ relatedTarget: this }, o, e)
        );
      return (
        this._supress[t] ||
          (h.each(this._plugins, function (t, e) {
            e.onTrigger && e.onTrigger(a);
          }),
          this.register({ type: l.Type.Event, name: t }),
          this.$element.trigger(a),
          this.settings &&
            "function" == typeof this.settings[r] &&
            this.settings[r].call(this, a)),
        a
      );
    }),
    (l.prototype.enter = function (t) {
      h.each(
        [t].concat(this._states.tags[t] || []),
        h.proxy(function (t, e) {
          this._states.current[e] === a && (this._states.current[e] = 0),
            this._states.current[e]++;
        }, this)
      );
    }),
    (l.prototype.leave = function (t) {
      h.each(
        [t].concat(this._states.tags[t] || []),
        h.proxy(function (t, e) {
          this._states.current[e]--;
        }, this)
      );
    }),
    (l.prototype.register = function (i) {
      if (i.type === l.Type.Event) {
        if (
          (h.event.special[i.name] || (h.event.special[i.name] = {}),
          !h.event.special[i.name].owl)
        ) {
          var e = h.event.special[i.name]._default;
          (h.event.special[i.name]._default = function (t) {
            return !e ||
              !e.apply ||
              (t.namespace && -1 !== t.namespace.indexOf("owl"))
              ? t.namespace && -1 < t.namespace.indexOf("owl")
              : e.apply(this, arguments);
          }),
            (h.event.special[i.name].owl = !0);
        }
      } else
        i.type === l.Type.State &&
          (this._states.tags[i.name]
            ? (this._states.tags[i.name] = this._states.tags[i.name].concat(
                i.tags
              ))
            : (this._states.tags[i.name] = i.tags),
          (this._states.tags[i.name] = h.grep(
            this._states.tags[i.name],
            h.proxy(function (t, e) {
              return h.inArray(t, this._states.tags[i.name]) === e;
            }, this)
          )));
    }),
    (l.prototype.suppress = function (t) {
      h.each(
        t,
        h.proxy(function (t, e) {
          this._supress[e] = !0;
        }, this)
      );
    }),
    (l.prototype.release = function (t) {
      h.each(
        t,
        h.proxy(function (t, e) {
          delete this._supress[e];
        }, this)
      );
    }),
    (l.prototype.pointer = function (t) {
      var e = { x: null, y: null };
      return (
        (t =
          (t = t.originalEvent || t || i.event).touches && t.touches.length
            ? t.touches[0]
            : t.changedTouches && t.changedTouches.length
            ? t.changedTouches[0]
            : t).pageX
          ? ((e.x = t.pageX), (e.y = t.pageY))
          : ((e.x = t.clientX), (e.y = t.clientY)),
        e
      );
    }),
    (l.prototype.isNumeric = function (t) {
      return !isNaN(parseFloat(t));
    }),
    (l.prototype.difference = function (t, e) {
      return { x: t.x - e.x, y: t.y - e.y };
    }),
    (h.fn.owlCarousel = function (e) {
      var s = Array.prototype.slice.call(arguments, 1);
      return this.each(function () {
        var t = h(this),
          i = t.data("owl.carousel");
        i ||
          ((i = new l(this, "object" == typeof e && e)),
          t.data("owl.carousel", i),
          h.each(
            [
              "next",
              "prev",
              "to",
              "destroy",
              "refresh",
              "replace",
              "add",
              "remove",
            ],
            function (t, e) {
              i.register({ type: l.Type.Event, name: e }),
                i.$element.on(
                  e + ".owl.carousel.core",
                  h.proxy(function (t) {
                    t.namespace &&
                      t.relatedTarget !== this &&
                      (this.suppress([e]),
                      i[e].apply(this, [].slice.call(arguments, 1)),
                      this.release([e]));
                  }, i)
                );
            }
          )),
          "string" == typeof e && "_" !== e.charAt(0) && i[e].apply(i, s);
      });
    }),
    (h.fn.owlCarousel.Constructor = l);
})(window.Zepto || window.jQuery, window, document),
  (function (e, i, t, s) {
    var n = function (t) {
      (this._core = t),
        (this._interval = null),
        (this._visible = null),
        (this._handlers = {
          "initialized.owl.carousel": e.proxy(function (t) {
            t.namespace && this._core.settings.autoRefresh && this.watch();
          }, this),
        }),
        (this._core.options = e.extend({}, n.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (n.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
      (n.prototype.watch = function () {
        this._interval ||
          ((this._visible = this._core.isVisible()),
          (this._interval = i.setInterval(
            e.proxy(this.refresh, this),
            this._core.settings.autoRefreshInterval
          )));
      }),
      (n.prototype.refresh = function () {
        this._core.isVisible() !== this._visible &&
          ((this._visible = !this._visible),
          this._core.$element.toggleClass("owl-hidden", !this._visible),
          this._visible &&
            this._core.invalidate("width") &&
            this._core.refresh());
      }),
      (n.prototype.destroy = function () {
        var t, e;
        for (t in (i.clearInterval(this._interval), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (e.fn.owlCarousel.Constructor.Plugins.AutoRefresh = n);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, o, t, e) {
    var i = function (t) {
      (this._core = t),
        (this._loaded = []),
        (this._handlers = {
          "initialized.owl.carousel change.owl.carousel resized.owl.carousel":
            a.proxy(function (t) {
              if (
                t.namespace &&
                this._core.settings &&
                this._core.settings.lazyLoad &&
                ((t.property && "position" == t.property.name) ||
                  "initialized" == t.type)
              ) {
                var e = this._core.settings,
                  i = (e.center && Math.ceil(e.items / 2)) || e.items,
                  s = (e.center && -1 * i) || 0,
                  n =
                    (t.property && void 0 !== t.property.value
                      ? t.property.value
                      : this._core.current()) + s,
                  o = this._core.clones().length,
                  r = a.proxy(function (t, e) {
                    this.load(e);
                  }, this);
                for (
                  0 < e.lazyLoadEager &&
                  ((i += e.lazyLoadEager),
                  e.loop && ((n -= e.lazyLoadEager), i++));
                  s++ < i;

                )
                  this.load(o / 2 + this._core.relative(n)),
                    o && a.each(this._core.clones(this._core.relative(n)), r),
                    n++;
              }
            }, this),
        }),
        (this._core.options = a.extend({}, i.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (i.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
      (i.prototype.load = function (t) {
        var e = this._core.$stage.children().eq(t),
          i = e && e.find(".owl-lazy");
        !i ||
          -1 < a.inArray(e.get(0), this._loaded) ||
          (i.each(
            a.proxy(function (t, e) {
              var i,
                s = a(e),
                n =
                  (1 < o.devicePixelRatio && s.attr("data-src-retina")) ||
                  s.attr("data-src") ||
                  s.attr("data-srcset");
              this._core.trigger("load", { element: s, url: n }, "lazy"),
                s.is("img")
                  ? s
                      .one(
                        "load.owl.lazy",
                        a.proxy(function () {
                          s.css("opacity", 1),
                            this._core.trigger(
                              "loaded",
                              { element: s, url: n },
                              "lazy"
                            );
                        }, this)
                      )
                      .attr("src", n)
                  : s.is("source")
                  ? s
                      .one(
                        "load.owl.lazy",
                        a.proxy(function () {
                          this._core.trigger(
                            "loaded",
                            { element: s, url: n },
                            "lazy"
                          );
                        }, this)
                      )
                      .attr("srcset", n)
                  : (((i = new Image()).onload = a.proxy(function () {
                      s.css({
                        "background-image": 'url("' + n + '")',
                        opacity: "1",
                      }),
                        this._core.trigger(
                          "loaded",
                          { element: s, url: n },
                          "lazy"
                        );
                    }, this)),
                    (i.src = n));
            }, this)
          ),
          this._loaded.push(e.get(0)));
      }),
      (i.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Lazy = i);
  })(window.Zepto || window.jQuery, window, document),
  (function (r, i, t, e) {
    var s = function (t) {
      (this._core = t),
        (this._previousHeight = null),
        (this._handlers = {
          "initialized.owl.carousel refreshed.owl.carousel": r.proxy(function (
            t
          ) {
            t.namespace && this._core.settings.autoHeight && this.update();
          },
          this),
          "changed.owl.carousel": r.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              "position" === t.property.name &&
              this.update();
          }, this),
          "loaded.owl.lazy": r.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              t.element.closest("." + this._core.settings.itemClass).index() ===
                this._core.current() &&
              this.update();
          }, this),
        }),
        (this._core.options = r.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        (this._intervalId = null);
      var e = this;
      r(i).on("load", function () {
        e._core.settings.autoHeight && e.update();
      }),
        r(i).resize(function () {
          e._core.settings.autoHeight &&
            (null != e._intervalId && clearTimeout(e._intervalId),
            (e._intervalId = setTimeout(function () {
              e.update();
            }, 250)));
        });
    };
    (s.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
      (s.prototype.update = function () {
        var t = this._core._current,
          e = t + this._core.settings.items,
          i = this._core.settings.lazyLoad,
          s = this._core.$stage.children().toArray().slice(t, e),
          n = [],
          o = 0;
        r.each(s, function (t, e) {
          n.push(r(e).height());
        }),
          (o = Math.max.apply(null, n)) <= 1 &&
            i &&
            this._previousHeight &&
            (o = this._previousHeight),
          (this._previousHeight = o),
          this._core.$stage
            .parent()
            .height(o)
            .addClass(this._core.settings.autoHeightClass);
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (r.fn.owlCarousel.Constructor.Plugins.AutoHeight = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (c, t, e, i) {
    var s = function (t) {
      (this._core = t),
        (this._videos = {}),
        (this._playing = null),
        (this._handlers = {
          "initialized.owl.carousel": c.proxy(function (t) {
            t.namespace &&
              this._core.register({
                type: "state",
                name: "playing",
                tags: ["interacting"],
              });
          }, this),
          "resize.owl.carousel": c.proxy(function (t) {
            t.namespace &&
              this._core.settings.video &&
              this.isInFullScreen() &&
              t.preventDefault();
          }, this),
          "refreshed.owl.carousel": c.proxy(function (t) {
            t.namespace &&
              this._core.is("resizing") &&
              this._core.$stage.find(".cloned .owl-video-frame").remove();
          }, this),
          "changed.owl.carousel": c.proxy(function (t) {
            t.namespace &&
              "position" === t.property.name &&
              this._playing &&
              this.stop();
          }, this),
          "prepared.owl.carousel": c.proxy(function (t) {
            if (t.namespace) {
              var e = c(t.content).find(".owl-video");
              e.length &&
                (e.css("display", "none"), this.fetch(e, c(t.content)));
            }
          }, this),
        }),
        (this._core.options = c.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        this._core.$element.on(
          "click.owl.video",
          ".owl-video-play-icon",
          c.proxy(function (t) {
            this.play(t);
          }, this)
        );
    };
    (s.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
      (s.prototype.fetch = function (t, e) {
        var i = t.attr("data-vimeo-id")
            ? "vimeo"
            : t.attr("data-vzaar-id")
            ? "vzaar"
            : "youtube",
          s =
            t.attr("data-vimeo-id") ||
            t.attr("data-youtube-id") ||
            t.attr("data-vzaar-id"),
          n = t.attr("data-width") || this._core.settings.videoWidth,
          o = t.attr("data-height") || this._core.settings.videoHeight,
          r = t.attr("href");
        if (!r) throw new Error("Missing video URL.");
        if (
          -1 <
          (s = r.match(
            /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          ))[3].indexOf("youtu")
        )
          i = "youtube";
        else if (-1 < s[3].indexOf("vimeo")) i = "vimeo";
        else {
          if (!(-1 < s[3].indexOf("vzaar")))
            throw new Error("Video URL not supported.");
          i = "vzaar";
        }
        (s = s[6]),
          (this._videos[r] = { type: i, id: s, width: n, height: o }),
          e.attr("data-video", r),
          this.thumbnail(t, this._videos[r]);
      }),
      (s.prototype.thumbnail = function (e, t) {
        var i,
          s,
          n =
            t.width && t.height
              ? "width:" + t.width + "px;height:" + t.height + "px;"
              : "",
          o = e.find("img"),
          r = "src",
          a = "",
          h = this._core.settings,
          l = function (t) {
            (i = h.lazyLoad
              ? c("<div/>", { class: "owl-video-tn " + a, srcType: t })
              : c("<div/>", {
                  class: "owl-video-tn",
                  style: "opacity:1;background-image:url(" + t + ")",
                })),
              e.after(i),
              e.after('<div class="owl-video-play-icon"></div>');
          };
        if (
          (e.wrap(c("<div/>", { class: "owl-video-wrapper", style: n })),
          this._core.settings.lazyLoad && ((r = "data-src"), (a = "owl-lazy")),
          o.length)
        )
          return l(o.attr(r)), o.remove(), !1;
        "youtube" === t.type
          ? ((s = "//img.youtube.com/vi/" + t.id + "/hqdefault.jpg"), l(s))
          : "vimeo" === t.type
          ? c.ajax({
              type: "GET",
              url: "//vimeo.com/api/v2/video/" + t.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (t) {
                (s = t[0].thumbnail_large), l(s);
              },
            })
          : "vzaar" === t.type &&
            c.ajax({
              type: "GET",
              url: "//vzaar.com/api/videos/" + t.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (t) {
                (s = t.framegrab_url), l(s);
              },
            });
      }),
      (s.prototype.stop = function () {
        this._core.trigger("stop", null, "video"),
          this._playing.find(".owl-video-frame").remove(),
          this._playing.removeClass("owl-video-playing"),
          (this._playing = null),
          this._core.leave("playing"),
          this._core.trigger("stopped", null, "video");
      }),
      (s.prototype.play = function (t) {
        var e,
          i = c(t.target).closest("." + this._core.settings.itemClass),
          s = this._videos[i.attr("data-video")],
          n = s.width || "100%",
          o = s.height || this._core.$stage.height();
        this._playing ||
          (this._core.enter("playing"),
          this._core.trigger("play", null, "video"),
          (i = this._core.items(this._core.relative(i.index()))),
          this._core.reset(i.index()),
          (e = c(
            '<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'
          )).attr("height", o),
          e.attr("width", n),
          "youtube" === s.type
            ? e.attr(
                "src",
                "//www.youtube.com/embed/" +
                  s.id +
                  "?autoplay=1&rel=0&v=" +
                  s.id
              )
            : "vimeo" === s.type
            ? e.attr("src", "//player.vimeo.com/video/" + s.id + "?autoplay=1")
            : "vzaar" === s.type &&
              e.attr(
                "src",
                "//view.vzaar.com/" + s.id + "/player?autoplay=true"
              ),
          c(e)
            .wrap('<div class="owl-video-frame" />')
            .insertAfter(i.find(".owl-video")),
          (this._playing = i.addClass("owl-video-playing")));
      }),
      (s.prototype.isInFullScreen = function () {
        var t =
          e.fullscreenElement ||
          e.mozFullScreenElement ||
          e.webkitFullscreenElement;
        return t && c(t).parent().hasClass("owl-video-frame");
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in (this._core.$element.off("click.owl.video"), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (c.fn.owlCarousel.Constructor.Plugins.Video = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (r, t, e, i) {
    var s = function (t) {
      (this.core = t),
        (this.core.options = r.extend({}, s.Defaults, this.core.options)),
        (this.swapping = !0),
        (this.previous = void 0),
        (this.next = void 0),
        (this.handlers = {
          "change.owl.carousel": r.proxy(function (t) {
            t.namespace &&
              "position" == t.property.name &&
              ((this.previous = this.core.current()),
              (this.next = t.property.value));
          }, this),
          "drag.owl.carousel dragged.owl.carousel translated.owl.carousel":
            r.proxy(function (t) {
              t.namespace && (this.swapping = "translated" == t.type);
            }, this),
          "translate.owl.carousel": r.proxy(function (t) {
            t.namespace &&
              this.swapping &&
              (this.core.options.animateOut || this.core.options.animateIn) &&
              this.swap();
          }, this),
        }),
        this.core.$element.on(this.handlers);
    };
    (s.Defaults = { animateOut: !1, animateIn: !1 }),
      (s.prototype.swap = function () {
        if (
          1 === this.core.settings.items &&
          r.support.animation &&
          r.support.transition
        ) {
          this.core.speed(0);
          var t,
            e = r.proxy(this.clear, this),
            i = this.core.$stage.children().eq(this.previous),
            s = this.core.$stage.children().eq(this.next),
            n = this.core.settings.animateIn,
            o = this.core.settings.animateOut;
          this.core.current() !== this.previous &&
            (o &&
              ((t =
                this.core.coordinates(this.previous) -
                this.core.coordinates(this.next)),
              i
                .one(r.support.animation.end, e)
                .css({ left: t + "px" })
                .addClass("animated owl-animated-out")
                .addClass(o)),
            n &&
              s
                .one(r.support.animation.end, e)
                .addClass("animated owl-animated-in")
                .addClass(n));
        }
      }),
      (s.prototype.clear = function (t) {
        r(t.target)
          .css({ left: "" })
          .removeClass("animated owl-animated-out owl-animated-in")
          .removeClass(this.core.settings.animateIn)
          .removeClass(this.core.settings.animateOut),
          this.core.onTransitionEnd();
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (r.fn.owlCarousel.Constructor.Plugins.Animate = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (s, n, e, t) {
    var i = function (t) {
      (this._core = t),
        (this._call = null),
        (this._time = 0),
        (this._timeout = 0),
        (this._paused = !0),
        (this._handlers = {
          "changed.owl.carousel": s.proxy(function (t) {
            t.namespace && "settings" === t.property.name
              ? this._core.settings.autoplay
                ? this.play()
                : this.stop()
              : t.namespace &&
                "position" === t.property.name &&
                this._paused &&
                (this._time = 0);
          }, this),
          "initialized.owl.carousel": s.proxy(function (t) {
            t.namespace && this._core.settings.autoplay && this.play();
          }, this),
          "play.owl.autoplay": s.proxy(function (t, e, i) {
            t.namespace && this.play(e, i);
          }, this),
          "stop.owl.autoplay": s.proxy(function (t) {
            t.namespace && this.stop();
          }, this),
          "mouseover.owl.autoplay": s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "mouseleave.owl.autoplay": s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.play();
          }, this),
          "touchstart.owl.core": s.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "touchend.owl.core": s.proxy(function () {
            this._core.settings.autoplayHoverPause && this.play();
          }, this),
        }),
        this._core.$element.on(this._handlers),
        (this._core.options = s.extend({}, i.Defaults, this._core.options));
    };
    (i.Defaults = {
      autoplay: !1,
      autoplayTimeout: 5e3,
      autoplayHoverPause: !1,
      autoplaySpeed: !1,
    }),
      (i.prototype._next = function (t) {
        (this._call = n.setTimeout(
          s.proxy(this._next, this, t),
          this._timeout * (Math.round(this.read() / this._timeout) + 1) -
            this.read()
        )),
          this._core.is("interacting") ||
            e.hidden ||
            this._core.next(t || this._core.settings.autoplaySpeed);
      }),
      (i.prototype.read = function () {
        return new Date().getTime() - this._time;
      }),
      (i.prototype.play = function (t, e) {
        var i;
        this._core.is("rotating") || this._core.enter("rotating"),
          (t = t || this._core.settings.autoplayTimeout),
          (i = Math.min(this._time % (this._timeout || t), t)),
          this._paused
            ? ((this._time = this.read()), (this._paused = !1))
            : n.clearTimeout(this._call),
          (this._time += (this.read() % t) - i),
          (this._timeout = t),
          (this._call = n.setTimeout(s.proxy(this._next, this, e), t - i));
      }),
      (i.prototype.stop = function () {
        this._core.is("rotating") &&
          ((this._time = 0),
          (this._paused = !0),
          n.clearTimeout(this._call),
          this._core.leave("rotating"));
      }),
      (i.prototype.pause = function () {
        this._core.is("rotating") &&
          !this._paused &&
          ((this._time = this.read()),
          (this._paused = !0),
          n.clearTimeout(this._call));
      }),
      (i.prototype.destroy = function () {
        var t, e;
        for (t in (this.stop(), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (s.fn.owlCarousel.Constructor.Plugins.autoplay = i);
  })(window.Zepto || window.jQuery, window, document),
  (function (o, t, e, i) {
    "use strict";
    var s = function (t) {
      (this._core = t),
        (this._initialized = !1),
        (this._pages = []),
        (this._controls = {}),
        (this._templates = []),
        (this.$element = this._core.$element),
        (this._overrides = {
          next: this._core.next,
          prev: this._core.prev,
          to: this._core.to,
        }),
        (this._handlers = {
          "prepared.owl.carousel": o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.push(
                '<div class="' +
                  this._core.settings.dotClass +
                  '">' +
                  o(t.content)
                    .find("[data-dot]")
                    .addBack("[data-dot]")
                    .attr("data-dot") +
                  "</div>"
              );
          }, this),
          "added.owl.carousel": o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 0, this._templates.pop());
          }, this),
          "remove.owl.carousel": o.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 1);
          }, this),
          "changed.owl.carousel": o.proxy(function (t) {
            t.namespace && "position" == t.property.name && this.draw();
          }, this),
          "initialized.owl.carousel": o.proxy(function (t) {
            t.namespace &&
              !this._initialized &&
              (this._core.trigger("initialize", null, "navigation"),
              this.initialize(),
              this.update(),
              this.draw(),
              (this._initialized = !0),
              this._core.trigger("initialized", null, "navigation"));
          }, this),
          "refreshed.owl.carousel": o.proxy(function (t) {
            t.namespace &&
              this._initialized &&
              (this._core.trigger("refresh", null, "navigation"),
              this.update(),
              this.draw(),
              this._core.trigger("refreshed", null, "navigation"));
          }, this),
        }),
        (this._core.options = o.extend({}, s.Defaults, this._core.options)),
        this.$element.on(this._handlers);
    };
    (s.Defaults = {
      nav: !1,
      navText: [
        '<span aria-label="Previous">&#x2039;</span>',
        '<span aria-label="Next">&#x203a;</span>',
      ],
      navSpeed: !1,
      navElement: 'button type="button" role="presentation"',
      navContainer: !1,
      navContainerClass: "owl-nav",
      navClass: ["owl-prev", "owl-next"],
      slideBy: 1,
      dotClass: "owl-dot",
      dotsClass: "owl-dots",
      dots: !0,
      dotsEach: !1,
      dotsData: !1,
      dotsSpeed: !1,
      dotsContainer: !1,
    }),
      (s.prototype.initialize = function () {
        var t,
          i = this._core.settings;
        for (t in ((this._controls.$relative = (
          i.navContainer
            ? o(i.navContainer)
            : o("<div>").addClass(i.navContainerClass).appendTo(this.$element)
        ).addClass("disabled")),
        (this._controls.$previous = o("<" + i.navElement + ">")
          .addClass(i.navClass[0])
          .html(i.navText[0])
          .prependTo(this._controls.$relative)
          .on(
            "click",
            o.proxy(function (t) {
              this.prev(i.navSpeed);
            }, this)
          )),
        (this._controls.$next = o("<" + i.navElement + ">")
          .addClass(i.navClass[1])
          .html(i.navText[1])
          .appendTo(this._controls.$relative)
          .on(
            "click",
            o.proxy(function (t) {
              this.next(i.navSpeed);
            }, this)
          )),
        i.dotsData ||
          (this._templates = [
            o('<button role="button">')
              .addClass(i.dotClass)
              .append(o("<span>"))
              .prop("outerHTML"),
          ]),
        (this._controls.$absolute = (
          i.dotsContainer
            ? o(i.dotsContainer)
            : o("<div>").addClass(i.dotsClass).appendTo(this.$element)
        ).addClass("disabled")),
        this._controls.$absolute.on(
          "click",
          "button",
          o.proxy(function (t) {
            var e = o(t.target).parent().is(this._controls.$absolute)
              ? o(t.target).index()
              : o(t.target).parent().index();
            t.preventDefault(), this.to(e, i.dotsSpeed);
          }, this)
        ),
        this._overrides))
          this._core[t] = o.proxy(this[t], this);
      }),
      (s.prototype.destroy = function () {
        var t, e, i, s, n;
        for (t in ((n = this._core.settings), this._handlers))
          this.$element.off(t, this._handlers[t]);
        for (e in this._controls)
          "$relative" === e && n.navContainer
            ? this._controls[e].html("")
            : this._controls[e].remove();
        for (s in this.overides) this._core[s] = this._overrides[s];
        for (i in Object.getOwnPropertyNames(this))
          "function" != typeof this[i] && (this[i] = null);
      }),
      (s.prototype.update = function () {
        var t,
          e,
          i = this._core.clones().length / 2,
          s = i + this._core.items().length,
          n = this._core.maximum(!0),
          o = this._core.settings,
          r = o.center || o.autoWidth || o.dotsData ? 1 : o.dotsEach || o.items;
        if (
          ("page" !== o.slideBy && (o.slideBy = Math.min(o.slideBy, o.items)),
          o.dots || "page" == o.slideBy)
        )
          for (this._pages = [], t = i, e = 0; t < s; t++) {
            if (r <= e || 0 === e) {
              if (
                (this._pages.push({
                  start: Math.min(n, t - i),
                  end: t - i + r - 1,
                }),
                Math.min(n, t - i) === n)
              )
                break;
              e = 0;
            }
            e += this._core.mergers(this._core.relative(t));
          }
      }),
      (s.prototype.draw = function () {
        var t,
          e = this._core.settings,
          i = this._core.items().length <= e.items,
          s = this._core.relative(this._core.current()),
          n = e.loop || e.rewind;
        this._controls.$relative.toggleClass("disabled", !e.nav || i),
          e.nav &&
            (this._controls.$previous.toggleClass(
              "disabled",
              !n && s <= this._core.minimum(!0)
            ),
            this._controls.$next.toggleClass(
              "disabled",
              !n && s >= this._core.maximum(!0)
            )),
          this._controls.$absolute.toggleClass("disabled", !e.dots || i),
          e.dots &&
            ((t =
              this._pages.length - this._controls.$absolute.children().length),
            e.dotsData && 0 !== t
              ? this._controls.$absolute.html(this._templates.join(""))
              : 0 < t
              ? this._controls.$absolute.append(
                  new Array(t + 1).join(this._templates[0])
                )
              : t < 0 && this._controls.$absolute.children().slice(t).remove(),
            this._controls.$absolute.find(".active").removeClass("active"),
            this._controls.$absolute
              .children()
              .eq(o.inArray(this.current(), this._pages))
              .addClass("active"));
      }),
      (s.prototype.onTrigger = function (t) {
        var e = this._core.settings;
        t.page = {
          index: o.inArray(this.current(), this._pages),
          count: this._pages.length,
          size:
            e &&
            (e.center || e.autoWidth || e.dotsData ? 1 : e.dotsEach || e.items),
        };
      }),
      (s.prototype.current = function () {
        var i = this._core.relative(this._core.current());
        return o
          .grep(
            this._pages,
            o.proxy(function (t, e) {
              return t.start <= i && t.end >= i;
            }, this)
          )
          .pop();
      }),
      (s.prototype.getPosition = function (t) {
        var e,
          i,
          s = this._core.settings;
        return (
          "page" == s.slideBy
            ? ((e = o.inArray(this.current(), this._pages)),
              (i = this._pages.length),
              t ? ++e : --e,
              (e = this._pages[((e % i) + i) % i].start))
            : ((e = this._core.relative(this._core.current())),
              (i = this._core.items().length),
              t ? (e += s.slideBy) : (e -= s.slideBy)),
          e
        );
      }),
      (s.prototype.next = function (t) {
        o.proxy(this._overrides.to, this._core)(this.getPosition(!0), t);
      }),
      (s.prototype.prev = function (t) {
        o.proxy(this._overrides.to, this._core)(this.getPosition(!1), t);
      }),
      (s.prototype.to = function (t, e, i) {
        var s;
        !i && this._pages.length
          ? ((s = this._pages.length),
            o.proxy(this._overrides.to, this._core)(
              this._pages[((t % s) + s) % s].start,
              e
            ))
          : o.proxy(this._overrides.to, this._core)(t, e);
      }),
      (o.fn.owlCarousel.Constructor.Plugins.Navigation = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (s, n, t, e) {
    "use strict";
    var i = function (t) {
      (this._core = t),
        (this._hashes = {}),
        (this.$element = this._core.$element),
        (this._handlers = {
          "initialized.owl.carousel": s.proxy(function (t) {
            t.namespace &&
              "URLHash" === this._core.settings.startPosition &&
              s(n).trigger("hashchange.owl.navigation");
          }, this),
          "prepared.owl.carousel": s.proxy(function (t) {
            if (t.namespace) {
              var e = s(t.content)
                .find("[data-hash]")
                .addBack("[data-hash]")
                .attr("data-hash");
              if (!e) return;
              this._hashes[e] = t.content;
            }
          }, this),
          "changed.owl.carousel": s.proxy(function (t) {
            if (t.namespace && "position" === t.property.name) {
              var i = this._core.items(
                  this._core.relative(this._core.current())
                ),
                e = s
                  .map(this._hashes, function (t, e) {
                    return t === i ? e : null;
                  })
                  .join();
              if (!e || n.location.hash.slice(1) === e) return;
              n.location.hash = e;
            }
          }, this),
        }),
        (this._core.options = s.extend({}, i.Defaults, this._core.options)),
        this.$element.on(this._handlers),
        s(n).on(
          "hashchange.owl.navigation",
          s.proxy(function (t) {
            var e = n.location.hash.substring(1),
              i = this._core.$stage.children(),
              s = this._hashes[e] && i.index(this._hashes[e]);
            void 0 !== s &&
              s !== this._core.current() &&
              this._core.to(this._core.relative(s), !1, !0);
          }, this)
        );
    };
    (i.Defaults = { URLhashListener: !1 }),
      (i.prototype.destroy = function () {
        var t, e;
        for (t in (s(n).off("hashchange.owl.navigation"), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (s.fn.owlCarousel.Constructor.Plugins.Hash = i);
  })(window.Zepto || window.jQuery, window, document),
  (function (n, t, e, o) {
    var r = n("<support>").get(0).style,
      a = "Webkit Moz O ms".split(" "),
      i = {
        transition: {
          end: {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            transition: "transitionend",
          },
        },
        animation: {
          end: {
            WebkitAnimation: "webkitAnimationEnd",
            MozAnimation: "animationend",
            OAnimation: "oAnimationEnd",
            animation: "animationend",
          },
        },
      };
    function s(t, i) {
      var s = !1,
        e = t.charAt(0).toUpperCase() + t.slice(1);
      return (
        n.each((t + " " + a.join(e + " ") + e).split(" "), function (t, e) {
          if (r[e] !== o) return (s = !i || e), !1;
        }),
        s
      );
    }
    function h(t) {
      return s(t, !0);
    }
    !!s("transition") &&
      ((n.support.transition = new String(h("transition"))),
      (n.support.transition.end = i.transition.end[n.support.transition])),
      !!s("animation") &&
        ((n.support.animation = new String(h("animation"))),
        (n.support.animation.end = i.animation.end[n.support.animation])),
      s("transform") &&
        ((n.support.transform = new String(h("transform"))),
        (n.support.transform3d = !!s("perspective")));
  })(window.Zepto || window.jQuery, window, document);
