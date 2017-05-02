var KNStaticAssets = {};
KNStaticAssets["KNTransitionSwoosh_Shadow.png"] = new Image();
KNStaticAssets["KNTransitionSwoosh_Shadow.png"].src = static_url("KNTransitionSwoosh_Shadow.png");
KNStaticAssets["KNTransitionSlide_Black.png"] = new Image();
KNStaticAssets["KNTransitionSlide_Black.png"].src = static_url("KNTransitionSlide_Black.png");
var TextureManager = Class.create({
    initialize: function(a) {
        this.script = null;
        this.showUrl = a;
        this.sceneCache = {};
        this.slideCache = {};
        this.sceneDidLoadCallbackHandler = null;
        this.viewScale = 1;
        document.observe(kScriptDidDownloadEvent, (function(b) {
            this.handleScriptDidDownloadEvent(b)
        }).bind(this), false)
    },
    setSceneDidLoadCallbackHandler: function(a, b) {
        this.sceneDidLoadCallbackHandler = {
            handler: a,
            sceneIndex: b
        }
    },
    processTextureDidLoadCallback: function(d, b) {
        if (this.sceneDidLoadCallbackHandler == null) {
            return
        }
        var c = this.sceneDidLoadCallbackHandler.sceneIndex;
        var a = this.script.slideIndexFromSceneIndexLookup[c];
        if (a != b) {
            return
        }
        if (this.isSlidePreloaded(b)) {
            this.callSceneDidLoadCallback()
        }
    },
    processSlideDidLoadCallback: function(b) {
        if (this.sceneDidLoadCallbackHandler == null) {
            return
        }
        var c = this.sceneDidLoadCallbackHandler.sceneIndex;
        var a = this.script.slideIndexFromSceneIndexLookup[c];
        if (a != b) {
            return
        }
        this.callSceneDidLoadCallback()
    },
    processSceneDidLoadCallback: function(a) {
        if (this.sceneDidLoadCallbackHandler && a === this.sceneDidLoadCallbackHandler.sceneIndex && this.isScenePreloaded(a)) {
            this.callSceneDidLoadCallback()
        }
    },
    callSceneDidLoadCallback: function() {
        this.sceneDidLoadCallbackHandler.handler();
        this.sceneDidLoadCallbackHandler = null
    },
    loadScene: function(c, a) {
        if (c < 0 || c > this.script.numScenes) {
            return
        }
        if (a) {
            this.setSceneDidLoadCallbackHandler(a, c)
        }
        var b = this.script.slideIndexFromSceneIndexLookup[c];
        if (this.delegate.loadTextureBySlideIndex) {
            this.assetForSlide(b)
        } else {
            this.requestTexturesForSlide(b)
        }
    },
    preloadScenes: function(a) {
        for (var c in a) {
            var b = this.script.slideIndexFromSceneIndexLookup[c];
            if (b == null) {
                continue
            }
            if (this.slideCache.hasOwnProperty(b) === false) {
                this.loadScene(c)
            }
        }
    },
    isSlidePreloaded: function(b) {
        var a = false;
        if (this.slideCache[b]) {
            a = true;
            for (var c in this.slideCache[b].textureRequests) {
                if (this.slideCache[b].textureRequests[c] === false) {
                    a = false;
                    break
                }
            }
        }
        return a
    },
    isScenePreloaded: function(c) {
        var b = this.script.slideIndexFromSceneIndexLookup[c];
        var a = this.isSlidePreloaded(b);
        return a
    },
    handleScriptDidDownloadEvent: function(a) {
        this.script = a.memo.script;
        this.delegate = a.memo.delegate
    },
    assetForSlide: function(f) {
        var d = this.slideCache[f];
        var c = this.script.slideList[f];
        var b = this.script.slides[c];
        var a = b.assets;
        if (d == null) {
            this.slideCache[f] = {};
            this.slideCache[f].textureAssets = {};
            this.slideCache[f].textureRequests = {};
            for (var g in a) {
                var e = a[g];
                if (e.type === "texture") {
                    this.slideCache[f].textureRequests[g] = false;
                    this.requestAsset(g, e, c, f)
                }
            }
        } else {
            if (this.isSlidePreloaded(f)) {
                this.processSlideDidLoadCallback(f)
            } else {
                for (var g in a) {
                    var e = a[g];
                    if (this.slideCache[f].textureRequests[g] === false && e.type === "texture") {
                        this.requestAsset(g, e, c, f)
                    }
                }
            }
        }
    },
    requestAsset: function(d, b, a, c) {
        requestedSlideIndex = c;
        if (b.assetRequest.type === "slide") {
            if (b.assetRequest.state === "incoming" || b.assetRequest.state === "incoming-reflection") {
                if (b.assetRequest.slide) {
                    requestedSlideIndex = this.script.slideList.indexOf(b.assetRequest.slide);
                    if (requestedSlideIndex === -1) {
                        if (this.script.loopSlideshow) {
                            requestedSlideIndex = 0
                        } else {
                            requestedSlideIndex = c;
                            b.assetRequest.state = "KNTransitionSlide_Black.png"
                        }
                    }
                } else {
                    if (c < this.script.slideList.length - 1) {
                        requestedSlideIndex = c + 1
                    } else {
                        if (this.script.loopSlideshow) {
                            requestedSlideIndex = 0
                        } else {
                            requestedSlideIndex = c;
                            b.assetRequest.state = "KNTransitionSlide_Black.png"
                        }
                    }
                }
            }
        }
        if (b.assetRequest.state === "incoming" || b.assetRequest.state === "incoming-reflection" || b.assetRequest.state === "outgoing" || b.assetRequest.state === "outgoing-reflection") {
            this.delegate.loadTextureBySlideIndex(requestedSlideIndex, b.assetRequest, (function(e, g, f) {
                this.slideCache[g].textureAssets[e] = f;
                this.slideCache[g].textureRequests[e] = true;
                this.processTextureDidLoadCallback(d, c)
            }).bind(this, d, c))
        } else {
            this.slideCache[c].textureAssets[d] = KNStaticAssets[b.assetRequest.state];
            this.slideCache[c].textureRequests[d] = true
        }
    },
    requestTexturesForSlide: function(f) {
        var d = this.slideCache[f];
        var c = this.script.slideList[f];
        var b = this.script.slides[c];
        var a = b.assets;
        if (d == null) {
            this.slideCache[f] = {};
            this.slideCache[f].textureAssets = {};
            this.slideCache[f].textureRequests = {};
            for (var g in a) {
                var e = a[g];
                if (e.type === "texture") {
                    this.slideCache[f].textureRequests[g] = false;
                    this.fetchTexture(g, c, f)
                }
            }
        } else {
            if (this.isSlidePreloaded(f)) {
                this.processSlideDidLoadCallback(f)
            } else {
                for (var g in a) {
                    var e = a[g];
                    if (this.slideCache[f].textureRequests[g] === false && e.type === "texture") {
                        this.fetchTexture(g, c, f)
                    }
                }
            }
        }
    },
    fetchTexture: function(h, d, f) {
        var c = this.urlForTexture(h, d);
        var g = c.substr(c.length - 3);
        if (g === "png") {
            var b = new Image();
            Event.observe(b, "load", this.handleImageOnloadEvent.bind(this, h, f));
            b.src = c;
            return
        }
        if (window.location.protocol === "file:") {
            c = c + "p";
            if (window.local_svg == null || window.local_svg == undefined) {
                window.local_svg = (function(i) {
                    this.handleFetchCompleted(null, i, true)
                }).bind(this)
            }
            var a = document.createElement("script");
            a.setAttribute("src", c);
            document.head.appendChild(a)
        } else {
            var e = {
                textureId: h,
                slideId: d,
                slideIndex: f
            };
            new Ajax.Request(c, {
                method: "get",
                onSuccess: this.handleFetchCompleted.bind(this, e)
            })
        }
    },
    handleFetchCompleted: function(r, d, n) {
        var a = this.viewScale;
        var t;
        var s;
        if (n) {
            t = d.name;
            slideId = d.slide;
            s = this.script.slideList.indexOf(slideId)
        } else {
            t = r.textureId;
            slideId = r.slideId;
            s = r.slideIndex
        }
        var f = this.urlForTexture(t, slideId);
        var l = f.substring(0, f.lastIndexOf("/") + 1);
        var j;
        var b = new DOMParser();
        if (n) {
            j = b.parseFromString(d.svg, "text/xml")
        } else {
            if (browserPrefix === "ms" && browserVersion < 10) {
                j = b.parseFromString(d.responseText, "text/xml")
            } else {
                j = d.responseXML
            }
        }
        var h = j.documentElement.getAttribute("viewBox").split(" ");
        var g = h[2];
        var m = h[3];
        var c = j.getElementsByTagName("image");
        for (var p = 0, e = c.length; p < e; p++) {
            var q = c[p];
            var o = q.getAttributeNS("http://www.w3.org/1999/xlink", "href");
            q.setAttributeNS("http://www.w3.org/1999/xlink", "href", l + o)
        }
        var k = document.importNode(j.documentElement, true);
        k.setAttributeNS("http://www.w3.org/2000/svg", "width", g);
        k.setAttributeNS("http://www.w3.org/2000/svg", "height", m);
        this.slideCache[s].textureAssets[t] = k;
        this.slideCache[s].textureRequests[t] = true;
        this.processTextureDidLoadCallback(t, s)
    },
    setViewScale: function(a) {
        if (this.viewScale !== a) {
            this.viewScale = a;
            this.sceneCache = null;
            this.sceneCache = {}
        }
    },
    handleImageOnloadEvent: function(d, c, b) {
        b = b || window.event;
        var a = b.target || b.srcElement;
        this.slideCache[c].textureAssets[d] = a;
        this.slideCache[c].textureRequests[d] = true;
        this.processTextureDidLoadCallback(d, c)
    },
    getTextureObject: function(d, c) {
        var a;
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        a = this.slideCache[b].textureAssets[c];
        return a
    },
    getTextureInfo: function(e, d) {
        var c = this.script.slideIndexFromSceneIndexLookup[e];
        if (c == null) {
            return null
        }
        var a = this.script.slideList[c];
        var b = this.script.slides[a].assets[d];
        return b
    },
    getTextureUrl: function(d, c) {
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        if (b == null) {
            return null
        }
        var a = this.script.slideList[b];
        return this.urlForTexture(c, a)
    },
    getMovieUrl: function(d, c) {
        var b = this.script.slideIndexFromSceneIndexLookup[d];
        if (b == null) {
            return null
        }
        var a = this.script.slideList[b];
        return this.urlForMovie(c, a)
    },
    urlForAsset: function(e, c) {
        var b = "";
        var d = this.script.slides[c].assets[e];
        if (d == null) {
            return b
        }
        var a = d.url.web;
        if ((a != null) && (a != "")) {
            if (a.toLowerCase().substring(0, 4) === "http") {
                b = a
            } else {
                b = this.showUrl + (c ? c + "/" : "") + a
            }
        }
        return b
    },
    urlForMovie: function(b, a) {
        return this.generateUrl(b, a, true)
    },
    urlForTexture: function(b, a) {
        return this.generateUrl(b, a, false)
    },
    generateUrl: function(g, c, f) {
        var b = "";
        var d = "";
        var e = this.script.slides[c].assets[g];
        if (e === null) {
            return b
        }
        if (f) {
            var a = this.script.slides[c].assets[e.movie];
            d = a.url.web
        } else {
            d = e.url.web
        }
        if ((d != null) && (d != "")) {
            if (d.toLowerCase().substring(0, 4) === "http") {
                b = d
            } else {
                b = this.showUrl + (c ? c + "/" : "") + d
            }
        }
        return b
    },
    scenesInCache: function() {
        var a = "";
        for (var b in this.sceneCache) {
            if (a != "") {
                a += ", "
            }
            a += b
        }
        return a
    }
});
