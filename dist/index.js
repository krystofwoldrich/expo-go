#!/usr/bin/env bun
// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/semver/internal/constants.js
var require_constants = __commonJS((exports, module) => {
  var SEMVER_SPEC_VERSION = "2.0.0";
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH = 16;
  var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  var RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
});

// node_modules/semver/internal/re.js
var require_re = __commonJS((exports, module) => {
  var {
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_LENGTH
  } = require_constants();
  var debug = require_debug();
  exports = module.exports = {};
  var re = exports.re = [];
  var safeRe = exports.safeRe = [];
  var src = exports.src = [];
  var safeSrc = exports.safeSrc = [];
  var t = exports.t = {};
  var R = 0;
  var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  var safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
  ];
  var makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  var createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? "g" : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
  createToken("FULL", `^${src[t.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
  createToken("COERCERTL", src[t.COERCE], true);
  createToken("COERCERTLFULL", src[t.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS((exports, module) => {
  var looseOption = Object.freeze({ loose: true });
  var emptyOpts = Object.freeze({});
  var parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  module.exports = parseOptions;
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS((exports, module) => {
  var numeric = /^[0-9]+$/;
  var compareIdentifiers = (a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a === b ? 0 : a < b ? -1 : 1;
    }
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
  };
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS((exports, module) => {
  var debug = require_debug();
  var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
  var { safeRe: re, t } = require_re();
  var parseOptions = require_parse_options();
  var { compareIdentifiers } = require_identifiers();

  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.major < other.major) {
        return -1;
      }
      if (this.major > other.major) {
        return 1;
      }
      if (this.minor < other.minor) {
        return -1;
      }
      if (this.minor > other.minor) {
        return 1;
      }
      if (this.patch < other.patch) {
        return -1;
      }
      if (this.patch > other.patch) {
        return 1;
      }
      return 0;
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  module.exports = SemVer;
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  module.exports = parse;
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS((exports, module) => {
  var parse = require_parse();
  var valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  module.exports = valid;
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS((exports, module) => {
  var parse = require_parse();
  var clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  module.exports = clean;
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var inc = (version, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = undefined;
    }
    try {
      return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  module.exports = inc;
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS((exports, module) => {
  var parse = require_parse();
  var diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (lowVersion.compareMain(highVersion) === 0) {
        if (lowVersion.minor && !lowVersion.patch) {
          return "minor";
        }
        return "patch";
      }
    }
    const prefix = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix + "patch";
    }
    return "prerelease";
  };
  module.exports = diff;
});

// node_modules/semver/functions/major.js
var require_major = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var major = (a, loose) => new SemVer(a, loose).major;
  module.exports = major;
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var minor = (a, loose) => new SemVer(a, loose).minor;
  module.exports = minor;
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var patch = (a, loose) => new SemVer(a, loose).patch;
  module.exports = patch;
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS((exports, module) => {
  var parse = require_parse();
  var prerelease = (version, options) => {
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  module.exports = prerelease;
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  module.exports = compare;
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS((exports, module) => {
  var compare = require_compare();
  var rcompare = (a, b, loose) => compare(b, a, loose);
  module.exports = rcompare;
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS((exports, module) => {
  var compare = require_compare();
  var compareLoose = (a, b) => compare(a, b, true);
  module.exports = compareLoose;
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  module.exports = compareBuild;
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS((exports, module) => {
  var compareBuild = require_compare_build();
  var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  module.exports = sort;
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS((exports, module) => {
  var compareBuild = require_compare_build();
  var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  module.exports = rsort;
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS((exports, module) => {
  var compare = require_compare();
  var gt = (a, b, loose) => compare(a, b, loose) > 0;
  module.exports = gt;
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS((exports, module) => {
  var compare = require_compare();
  var lt = (a, b, loose) => compare(a, b, loose) < 0;
  module.exports = lt;
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS((exports, module) => {
  var compare = require_compare();
  var eq = (a, b, loose) => compare(a, b, loose) === 0;
  module.exports = eq;
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS((exports, module) => {
  var compare = require_compare();
  var neq = (a, b, loose) => compare(a, b, loose) !== 0;
  module.exports = neq;
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS((exports, module) => {
  var compare = require_compare();
  var gte = (a, b, loose) => compare(a, b, loose) >= 0;
  module.exports = gte;
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS((exports, module) => {
  var compare = require_compare();
  var lte = (a, b, loose) => compare(a, b, loose) <= 0;
  module.exports = lte;
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS((exports, module) => {
  var eq = require_eq();
  var neq = require_neq();
  var gt = require_gt();
  var gte = require_gte();
  var lt = require_lt();
  var lte = require_lte();
  var cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  module.exports = cmp;
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var parse = require_parse();
  var { safeRe: re, t } = require_re();
  var coerce = (version, options) => {
    if (version instanceof SemVer) {
      return version;
    }
    if (typeof version === "number") {
      version = String(version);
    }
    if (typeof version !== "string") {
      return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
      match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  module.exports = coerce;
});

// node_modules/semver/functions/truncate.js
var require_truncate = __commonJS((exports, module) => {
  var parse = require_parse();
  var constants = require_constants();
  var SemVer = require_semver();
  var truncate = (version, truncation, options) => {
    if (!constants.RELEASE_TYPES.includes(truncation)) {
      return null;
    }
    const clonedVersion = cloneInputVersion(version, options);
    return clonedVersion && doTruncation(clonedVersion, truncation);
  };
  var cloneInputVersion = (version, options) => {
    const versionStringToParse = version instanceof SemVer ? version.version : version;
    return parse(versionStringToParse, options);
  };
  var doTruncation = (version, truncation) => {
    if (isPrerelease(truncation)) {
      return version.version;
    }
    version.prerelease = [];
    switch (truncation) {
      case "major":
        version.minor = 0;
        version.patch = 0;
        break;
      case "minor":
        version.patch = 0;
        break;
    }
    return version.format();
  };
  var isPrerelease = (type) => {
    return type.startsWith("pre");
  };
  module.exports = truncate;
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS((exports, module) => {
  class LRUCache {
    constructor() {
      this.max = 1000;
      this.map = new Map;
    }
    get(key) {
      const value = this.map.get(key);
      if (value === undefined) {
        return;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== undefined) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  module.exports = LRUCache;
});

// node_modules/semver/classes/range.js
var require_range = __commonJS((exports, module) => {
  var SPACE_CHARACTERS = /\s+/g;

  class Range {
    constructor(range, options) {
      options = parseOptions(options);
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        this.raw = range.value;
        this.set = [[range]];
        this.formatted = undefined;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = undefined;
    }
    get range() {
      if (this.formatted === undefined) {
        this.formatted = "";
        for (let i = 0;i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0;k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      range = range.replace(BUILDSTRIPRE, "");
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range);
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range);
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range);
      range = range.replace(re[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range);
      let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = new Map;
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0;i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  module.exports = Range;
  var LRU = require_lrucache();
  var cache = new LRU;
  var parseOptions = require_parse_options();
  var Comparator = require_comparator();
  var debug = require_debug();
  var SemVer = require_semver();
  var {
    safeRe: re,
    src,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = require_re();
  var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
  var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
  var isNullSet = (c) => c.value === "<0.0.0-0";
  var isAny = (c) => c.value === "";
  var isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  var parseComparator = (comp, options) => {
    comp = comp.replace(re[t.BUILD], "");
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  var replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  var replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  var replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  var replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  var replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  var replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  var replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re[t.STAR], "");
  };
  var replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  var testSet = (set, version, options) => {
    for (let i = 0;i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0;i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS((exports, module) => {
  var ANY = Symbol("SemVer ANY");

  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== undefined ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  module.exports = Comparator;
  var parseOptions = require_parse_options();
  var { safeRe: re, t } = require_re();
  var cmp = require_cmp();
  var debug = require_debug();
  var SemVer = require_semver();
  var Range = require_range();
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS((exports, module) => {
  var Range = require_range();
  var satisfies = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };
  module.exports = satisfies;
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS((exports, module) => {
  var Range = require_range();
  var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  module.exports = toComparators;
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var maxSatisfying = (versions, range, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max || maxSV.compare(v) === -1) {
          max = v;
          maxSV = new SemVer(max, options);
        }
      }
    });
    return max;
  };
  module.exports = maxSatisfying;
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var minSatisfying = (versions, range, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  module.exports = minSatisfying;
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var gt = require_gt();
  var minVersion = (range, loose) => {
    range = new Range(range, loose);
    let minver = new SemVer("0.0.0");
    if (range.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let setMin = null;
      comparators.forEach((comparator) => {
        const compver = new SemVer(comparator.semver.version);
        switch (comparator.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range.test(minver)) {
      return minver;
    }
    return null;
  };
  module.exports = minVersion;
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS((exports, module) => {
  var Range = require_range();
  var validRange = (range, options) => {
    try {
      return new Range(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  module.exports = validRange;
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var Range = require_range();
  var satisfies = require_satisfies();
  var gt = require_gt();
  var lt = require_lt();
  var lte = require_lte();
  var gte = require_gte();
  var outside = (version, range, hilo, options) => {
    version = new SemVer(version, options);
    range = new Range(range, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range, options)) {
      return false;
    }
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let high = null;
      let low = null;
      comparators.forEach((comparator) => {
        if (comparator.semver === ANY) {
          comparator = new Comparator(">=0.0.0");
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }
    return true;
  };
  module.exports = outside;
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS((exports, module) => {
  var outside = require_outside();
  var gtr = (version, range, options) => outside(version, range, ">", options);
  module.exports = gtr;
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS((exports, module) => {
  var outside = require_outside();
  var ltr = (version, range, options) => outside(version, range, "<", options);
  module.exports = ltr;
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS((exports, module) => {
  var Range = require_range();
  var intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  module.exports = intersects;
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS((exports, module) => {
  var satisfies = require_satisfies();
  var compare = require_compare();
  module.exports = (versions, range, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version of v) {
      const included = satisfies(version, range, options);
      if (included) {
        prev = version;
        if (!first) {
          first = version;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }
    const ranges = [];
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min);
      } else if (!max && min === v[0]) {
        ranges.push("*");
      } else if (!max) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max}`);
      } else {
        ranges.push(`${min} - ${max}`);
      }
    }
    const simplified = ranges.join(" || ");
    const original = typeof range.raw === "string" ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range;
  };
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS((exports, module) => {
  var Range = require_range();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var satisfies = require_satisfies();
  var compare = require_compare();
  var subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER:
      for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
    return true;
  };
  var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  var minimumVersion = [new Comparator(">=0.0.0")];
  var simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = new Set;
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !c.test(gt.semver)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !c.test(lt.semver)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false;
    }
    if (needDomGTPre || needDomLTPre) {
      return false;
    }
    return true;
  };
  var higherGT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  var lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  module.exports = subset;
});

// node_modules/semver/index.js
var require_semver2 = __commonJS((exports, module) => {
  var internalRe = require_re();
  var constants = require_constants();
  var SemVer = require_semver();
  var identifiers = require_identifiers();
  var parse = require_parse();
  var valid = require_valid();
  var clean = require_clean();
  var inc = require_inc();
  var diff = require_diff();
  var major = require_major();
  var minor = require_minor();
  var patch = require_patch();
  var prerelease = require_prerelease();
  var compare = require_compare();
  var rcompare = require_rcompare();
  var compareLoose = require_compare_loose();
  var compareBuild = require_compare_build();
  var sort = require_sort();
  var rsort = require_rsort();
  var gt = require_gt();
  var lt = require_lt();
  var eq = require_eq();
  var neq = require_neq();
  var gte = require_gte();
  var lte = require_lte();
  var cmp = require_cmp();
  var coerce = require_coerce();
  var truncate = require_truncate();
  var Comparator = require_comparator();
  var Range = require_range();
  var satisfies = require_satisfies();
  var toComparators = require_to_comparators();
  var maxSatisfying = require_max_satisfying();
  var minSatisfying = require_min_satisfying();
  var minVersion = require_min_version();
  var validRange = require_valid2();
  var outside = require_outside();
  var gtr = require_gtr();
  var ltr = require_ltr();
  var intersects = require_intersects();
  var simplifyRange = require_simplify();
  var subset = require_subset();
  module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    truncate,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers
  };
});

// src/log.ts
var Log = {
  debug(message) {
    if (process.env.DEBUG) {
      console.error(message);
    }
  },
  log(message) {
    console.log(message);
  },
  warn(message) {
    console.warn(message);
  }
};
var log_default = Log;

// src/style.ts
function bold(value) {
  if (process.env.NO_COLOR) {
    return value;
  }
  return `\x1B[1m${value}\x1B[22m`;
}

// src/utils/expoGo.ts
var import_semver = __toESM(require_semver2(), 1);
import { cp, lstat, mkdir as mkdir2, readdir, rm as rm2, stat } from "fs/promises";
import { homedir as homedir2 } from "os";
import path3 from "path";

// src/api.ts
function getExpoApiBaseUrl() {
  if (process.env.EXPO_STAGING) {
    return "https://staging-api.expo.dev";
  } else if (process.env.EXPO_LOCAL) {
    return "http://127.0.0.1:3000";
  }
  return "https://api.expo.dev";
}
async function apiGetAsync(path) {
  const response = await fetch(`${getExpoApiBaseUrl()}/v2/${path}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Request to Expo API failed with status ${response.status}`);
  }
  return await response.json();
}

// src/utils/download.ts
import { mkdir, rm } from "fs/promises";
import path from "path";

// node_modules/tar/dist/esm/index.min.js
import Vr from "events";
import I from "fs";
import { EventEmitter as Li } from "events";
import Ds from "stream";
import { StringDecoder as Br } from "string_decoder";
import or from "path";
import Vt from "fs";
import { dirname as Ln, parse as Nn } from "path";
import { EventEmitter as _n } from "events";
import Pi from "assert";
import { Buffer as Ot } from "buffer";
import * as vs from "zlib";
import Qr from "zlib";
import { posix as Zt } from "path";
import { basename as Sn } from "path";
import ui from "fs";
import $ from "fs";
import Xs from "path";
import { win32 as Cn } from "path";
import rr from "path";
import kr from "fs";
import ro from "assert";
import { randomBytes as Cr } from "crypto";
import u from "fs";
import R from "path";
import fr from "fs";
import Ei from "fs";
import we from "path";
import F from "fs";
import Jn from "fs/promises";
import wi from "path";
import { join as br } from "path";
import v from "fs";
import Fr from "path";
var vr = Object.defineProperty;
var Mr = (s, t) => {
  for (var e in t)
    vr(s, e, { get: t[e], enumerable: true });
};
var Ts = typeof process == "object" && process ? process : { stdout: null, stderr: null };
var Pr = (s) => !!s && typeof s == "object" && (s instanceof A || s instanceof Ds || zr(s) || Ur(s));
var zr = (s) => !!s && typeof s == "object" && s instanceof Li && typeof s.pipe == "function" && s.pipe !== Ds.Writable.prototype.pipe;
var Ur = (s) => !!s && typeof s == "object" && s instanceof Li && typeof s.write == "function" && typeof s.end == "function";
var q = Symbol("EOF");
var Q = Symbol("maybeEmitEnd");
var rt = Symbol("emittedEnd");
var Ne = Symbol("emittingEnd");
var Qt = Symbol("emittedError");
var De = Symbol("closed");
var xs = Symbol("read");
var Ae = Symbol("flush");
var Ls = Symbol("flushChunk");
var z = Symbol("encoding");
var Mt = Symbol("decoder");
var g = Symbol("flowing");
var Jt = Symbol("paused");
var Bt = Symbol("resume");
var b = Symbol("buffer");
var D = Symbol("pipes");
var _ = Symbol("bufferLength");
var gi = Symbol("bufferPush");
var Ie = Symbol("bufferShift");
var L = Symbol("objectMode");
var w = Symbol("destroyed");
var bi = Symbol("error");
var _i = Symbol("emitData");
var Ns = Symbol("emitEnd");
var Oi = Symbol("emitEnd2");
var Z = Symbol("async");
var Ti = Symbol("abort");
var Ce = Symbol("aborted");
var jt = Symbol("signal");
var Rt = Symbol("dataListeners");
var C = Symbol("discarded");
var te = (s) => Promise.resolve().then(s);
var Hr = (s) => s();
var Wr = (s) => s === "end" || s === "finish" || s === "prefinish";
var Gr = (s) => s instanceof ArrayBuffer || !!s && typeof s == "object" && s.constructor && s.constructor.name === "ArrayBuffer" && s.byteLength >= 0;
var Zr = (s) => !Buffer.isBuffer(s) && ArrayBuffer.isView(s);
var ke = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(t, e, i) {
    this.src = t, this.dest = e, this.opts = i, this.ondrain = () => t[Bt](), this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  proxyErrors(t) {}
  end() {
    this.unpipe(), this.opts.end && this.dest.end();
  }
};
var xi = class extends ke {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors), super.unpipe();
  }
  constructor(t, e, i) {
    super(t, e, i), this.proxyErrors = (r) => this.dest.emit("error", r), t.on("error", this.proxyErrors);
  }
};
var Yr = (s) => !!s.objectMode;
var Kr = (s) => !s.objectMode && !!s.encoding && s.encoding !== "buffer";
var A = class extends Li {
  [g] = false;
  [Jt] = false;
  [D] = [];
  [b] = [];
  [L];
  [z];
  [Z];
  [Mt];
  [q] = false;
  [rt] = false;
  [Ne] = false;
  [De] = false;
  [Qt] = null;
  [_] = 0;
  [w] = false;
  [jt];
  [Ce] = false;
  [Rt] = 0;
  [C] = false;
  writable = true;
  readable = true;
  constructor(...t) {
    let e = t[0] || {};
    if (super(), e.objectMode && typeof e.encoding == "string")
      throw new TypeError("Encoding and objectMode may not be used together");
    Yr(e) ? (this[L] = true, this[z] = null) : Kr(e) ? (this[z] = e.encoding, this[L] = false) : (this[L] = false, this[z] = null), this[Z] = !!e.async, this[Mt] = this[z] ? new Br(this[z]) : null, e && e.debugExposeBuffer === true && Object.defineProperty(this, "buffer", { get: () => this[b] }), e && e.debugExposePipes === true && Object.defineProperty(this, "pipes", { get: () => this[D] });
    let { signal: i } = e;
    i && (this[jt] = i, i.aborted ? this[Ti]() : i.addEventListener("abort", () => this[Ti]()));
  }
  get bufferLength() {
    return this[_];
  }
  get encoding() {
    return this[z];
  }
  set encoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  setEncoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  get objectMode() {
    return this[L];
  }
  set objectMode(t) {
    throw new Error("objectMode must be set at instantiation time");
  }
  get async() {
    return this[Z];
  }
  set async(t) {
    this[Z] = this[Z] || !!t;
  }
  [Ti]() {
    this[Ce] = true, this.emit("abort", this[jt]?.reason), this.destroy(this[jt]?.reason);
  }
  get aborted() {
    return this[Ce];
  }
  set aborted(t) {}
  write(t, e, i) {
    if (this[Ce])
      return false;
    if (this[q])
      throw new Error("write after end");
    if (this[w])
      return this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" })), true;
    typeof e == "function" && (i = e, e = "utf8"), e || (e = "utf8");
    let r = this[Z] ? te : Hr;
    if (!this[L] && !Buffer.isBuffer(t)) {
      if (Zr(t))
        t = Buffer.from(t.buffer, t.byteOffset, t.byteLength);
      else if (Gr(t))
        t = Buffer.from(t);
      else if (typeof t != "string")
        throw new Error("Non-contiguous data written to non-objectMode stream");
    }
    return this[L] ? (this[g] && this[_] !== 0 && this[Ae](true), this[g] ? this.emit("data", t) : this[gi](t), this[_] !== 0 && this.emit("readable"), i && r(i), this[g]) : t.length ? (typeof t == "string" && !(e === this[z] && !this[Mt]?.lastNeed) && (t = Buffer.from(t, e)), Buffer.isBuffer(t) && this[z] && (t = this[Mt].write(t)), this[g] && this[_] !== 0 && this[Ae](true), this[g] ? this.emit("data", t) : this[gi](t), this[_] !== 0 && this.emit("readable"), i && r(i), this[g]) : (this[_] !== 0 && this.emit("readable"), i && r(i), this[g]);
  }
  read(t) {
    if (this[w])
      return null;
    if (this[C] = false, this[_] === 0 || t === 0 || t && t > this[_])
      return this[Q](), null;
    this[L] && (t = null), this[b].length > 1 && !this[L] && (this[b] = [this[z] ? this[b].join("") : Buffer.concat(this[b], this[_])]);
    let e = this[xs](t || null, this[b][0]);
    return this[Q](), e;
  }
  [xs](t, e) {
    if (this[L])
      this[Ie]();
    else {
      let i = e;
      t === i.length || t === null ? this[Ie]() : typeof i == "string" ? (this[b][0] = i.slice(t), e = i.slice(0, t), this[_] -= t) : (this[b][0] = i.subarray(t), e = i.subarray(0, t), this[_] -= t);
    }
    return this.emit("data", e), !this[b].length && !this[q] && this.emit("drain"), e;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = undefined), typeof e == "function" && (i = e, e = "utf8"), t !== undefined && this.write(t, e), i && this.once("end", i), this[q] = true, this.writable = false, (this[g] || !this[Jt]) && this[Q](), this;
  }
  [Bt]() {
    this[w] || (!this[Rt] && !this[D].length && (this[C] = true), this[Jt] = false, this[g] = true, this.emit("resume"), this[b].length ? this[Ae]() : this[q] ? this[Q]() : this.emit("drain"));
  }
  resume() {
    return this[Bt]();
  }
  pause() {
    this[g] = false, this[Jt] = true, this[C] = false;
  }
  get destroyed() {
    return this[w];
  }
  get flowing() {
    return this[g];
  }
  get paused() {
    return this[Jt];
  }
  [gi](t) {
    this[L] ? this[_] += 1 : this[_] += t.length, this[b].push(t);
  }
  [Ie]() {
    return this[L] ? this[_] -= 1 : this[_] -= this[b][0].length, this[b].shift();
  }
  [Ae](t = false) {
    do
      ;
    while (this[Ls](this[Ie]()) && this[b].length);
    !t && !this[b].length && !this[q] && this.emit("drain");
  }
  [Ls](t) {
    return this.emit("data", t), this[g];
  }
  pipe(t, e) {
    if (this[w])
      return t;
    this[C] = false;
    let i = this[rt];
    return e = e || {}, t === Ts.stdout || t === Ts.stderr ? e.end = false : e.end = e.end !== false, e.proxyErrors = !!e.proxyErrors, i ? e.end && t.end() : (this[D].push(e.proxyErrors ? new xi(this, t, e) : new ke(this, t, e)), this[Z] ? te(() => this[Bt]()) : this[Bt]()), t;
  }
  unpipe(t) {
    let e = this[D].find((i) => i.dest === t);
    e && (this[D].length === 1 ? (this[g] && this[Rt] === 0 && (this[g] = false), this[D] = []) : this[D].splice(this[D].indexOf(e), 1), e.unpipe());
  }
  addListener(t, e) {
    return this.on(t, e);
  }
  on(t, e) {
    let i = super.on(t, e);
    if (t === "data")
      this[C] = false, this[Rt]++, !this[D].length && !this[g] && this[Bt]();
    else if (t === "readable" && this[_] !== 0)
      super.emit("readable");
    else if (Wr(t) && this[rt])
      super.emit(t), this.removeAllListeners(t);
    else if (t === "error" && this[Qt]) {
      let r = e;
      this[Z] ? te(() => r.call(this, this[Qt])) : r.call(this, this[Qt]);
    }
    return i;
  }
  removeListener(t, e) {
    return this.off(t, e);
  }
  off(t, e) {
    let i = super.off(t, e);
    return t === "data" && (this[Rt] = this.listeners("data").length, this[Rt] === 0 && !this[C] && !this[D].length && (this[g] = false)), i;
  }
  removeAllListeners(t) {
    let e = super.removeAllListeners(t);
    return (t === "data" || t === undefined) && (this[Rt] = 0, !this[C] && !this[D].length && (this[g] = false)), e;
  }
  get emittedEnd() {
    return this[rt];
  }
  [Q]() {
    !this[Ne] && !this[rt] && !this[w] && this[b].length === 0 && this[q] && (this[Ne] = true, this.emit("end"), this.emit("prefinish"), this.emit("finish"), this[De] && this.emit("close"), this[Ne] = false);
  }
  emit(t, ...e) {
    let i = e[0];
    if (t !== "error" && t !== "close" && t !== w && this[w])
      return false;
    if (t === "data")
      return !this[L] && !i ? false : this[Z] ? (te(() => this[_i](i)), true) : this[_i](i);
    if (t === "end")
      return this[Ns]();
    if (t === "close") {
      if (this[De] = true, !this[rt] && !this[w])
        return false;
      let n = super.emit("close");
      return this.removeAllListeners("close"), n;
    } else if (t === "error") {
      this[Qt] = i, super.emit(bi, i);
      let n = !this[jt] || this.listeners("error").length ? super.emit("error", i) : false;
      return this[Q](), n;
    } else if (t === "resume") {
      let n = super.emit("resume");
      return this[Q](), n;
    } else if (t === "finish" || t === "prefinish") {
      let n = super.emit(t);
      return this.removeAllListeners(t), n;
    }
    let r = super.emit(t, ...e);
    return this[Q](), r;
  }
  [_i](t) {
    for (let i of this[D])
      i.dest.write(t) === false && this.pause();
    let e = this[C] ? false : super.emit("data", t);
    return this[Q](), e;
  }
  [Ns]() {
    return this[rt] ? false : (this[rt] = true, this.readable = false, this[Z] ? (te(() => this[Oi]()), true) : this[Oi]());
  }
  [Oi]() {
    if (this[Mt]) {
      let e = this[Mt].end();
      if (e) {
        for (let i of this[D])
          i.dest.write(e);
        this[C] || super.emit("data", e);
      }
    }
    for (let e of this[D])
      e.end();
    let t = super.emit("end");
    return this.removeAllListeners("end"), t;
  }
  async collect() {
    let t = Object.assign([], { dataLength: 0 });
    this[L] || (t.dataLength = 0);
    let e = this.promise();
    return this.on("data", (i) => {
      t.push(i), this[L] || (t.dataLength += i.length);
    }), await e, t;
  }
  async concat() {
    if (this[L])
      throw new Error("cannot concat in objectMode");
    let t = await this.collect();
    return this[z] ? t.join("") : Buffer.concat(t, t.dataLength);
  }
  async promise() {
    return new Promise((t, e) => {
      this.on(w, () => e(new Error("stream destroyed"))), this.on("error", (i) => e(i)), this.on("end", () => t());
    });
  }
  [Symbol.asyncIterator]() {
    this[C] = false;
    let t = false, e = async () => (this.pause(), t = true, { value: undefined, done: true });
    return { next: () => {
      if (t)
        return e();
      let r = this.read();
      if (r !== null)
        return Promise.resolve({ done: false, value: r });
      if (this[q])
        return e();
      let n, o, h = (d) => {
        this.off("data", a), this.off("end", l), this.off(w, c), e(), o(d);
      }, a = (d) => {
        this.off("error", h), this.off("end", l), this.off(w, c), this.pause(), n({ value: d, done: !!this[q] });
      }, l = () => {
        this.off("error", h), this.off("data", a), this.off(w, c), e(), n({ done: true, value: undefined });
      }, c = () => h(new Error("stream destroyed"));
      return new Promise((d, S) => {
        o = S, n = d, this.once(w, c), this.once("error", h), this.once("end", l), this.once("data", a);
      });
    }, throw: e, return: e, [Symbol.asyncIterator]() {
      return this;
    }, [Symbol.asyncDispose]: async () => {} };
  }
  [Symbol.iterator]() {
    this[C] = false;
    let t = false, e = () => (this.pause(), this.off(bi, e), this.off(w, e), this.off("end", e), t = true, { done: true, value: undefined }), i = () => {
      if (t)
        return e();
      let r = this.read();
      return r === null ? e() : { done: false, value: r };
    };
    return this.once("end", e), this.once(bi, e), this.once(w, e), { next: i, throw: e, return: e, [Symbol.iterator]() {
      return this;
    }, [Symbol.dispose]: () => {} };
  }
  destroy(t) {
    if (this[w])
      return t ? this.emit("error", t) : this.emit(w), this;
    this[w] = true, this[C] = true, this[b].length = 0, this[_] = 0;
    let e = this;
    return typeof e.close == "function" && !this[De] && e.close(), t ? this.emit("error", t) : this.emit(w), this;
  }
  static get isStream() {
    return Pr;
  }
};
var $r = I.writev;
var ot = Symbol("_autoClose");
var H = Symbol("_close");
var ee = Symbol("_ended");
var m = Symbol("_fd");
var Ni = Symbol("_finished");
var j = Symbol("_flags");
var Di = Symbol("_flush");
var ki = Symbol("_handleChunk");
var Fi = Symbol("_makeBuf");
var se = Symbol("_mode");
var Fe = Symbol("_needDrain");
var Ut = Symbol("_onerror");
var Ht = Symbol("_onopen");
var Ai = Symbol("_onread");
var Pt = Symbol("_onwrite");
var ht = Symbol("_open");
var U = Symbol("_path");
var nt = Symbol("_pos");
var Y = Symbol("_queue");
var zt = Symbol("_read");
var Ii = Symbol("_readSize");
var J = Symbol("_reading");
var ie = Symbol("_remain");
var Ci = Symbol("_size");
var ve = Symbol("_write");
var gt = Symbol("_writing");
var Me = Symbol("_defaultFlag");
var bt = Symbol("_errored");
var _t = class extends A {
  [bt] = false;
  [m];
  [U];
  [Ii];
  [J] = false;
  [Ci];
  [ie];
  [ot];
  constructor(t, e) {
    if (e = e || {}, super(e), this.readable = true, this.writable = false, typeof t != "string")
      throw new TypeError("path must be a string");
    this[bt] = false, this[m] = typeof e.fd == "number" ? e.fd : undefined, this[U] = t, this[Ii] = e.readSize || 16 * 1024 * 1024, this[J] = false, this[Ci] = typeof e.size == "number" ? e.size : 1 / 0, this[ie] = this[Ci], this[ot] = typeof e.autoClose == "boolean" ? e.autoClose : true, typeof this[m] == "number" ? this[zt]() : this[ht]();
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  write() {
    throw new TypeError("this is a readable stream");
  }
  end() {
    throw new TypeError("this is a readable stream");
  }
  [ht]() {
    I.open(this[U], "r", (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[zt]());
  }
  [Fi]() {
    return Buffer.allocUnsafe(Math.min(this[Ii], this[ie]));
  }
  [zt]() {
    if (!this[J]) {
      this[J] = true;
      let t = this[Fi]();
      if (t.length === 0)
        return process.nextTick(() => this[Ai](null, 0, t));
      I.read(this[m], t, 0, t.length, null, (e, i, r) => this[Ai](e, i, r));
    }
  }
  [Ai](t, e, i) {
    this[J] = false, t ? this[Ut](t) : this[ki](e, i) && this[zt]();
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = undefined, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
  [Ut](t) {
    this[J] = true, this[H](), this.emit("error", t);
  }
  [ki](t, e) {
    let i = false;
    return this[ie] -= t, t > 0 && (i = super.write(t < e.length ? e.subarray(0, t) : e)), (t === 0 || this[ie] <= 0) && (i = false, this[H](), super.end()), i;
  }
  emit(t, ...e) {
    switch (t) {
      case "prefinish":
      case "finish":
        return false;
      case "drain":
        return typeof this[m] == "number" && this[zt](), false;
      case "error":
        return this[bt] ? false : (this[bt] = true, super.emit(t, ...e));
      default:
        return super.emit(t, ...e);
    }
  }
};
var Be = class extends _t {
  [ht]() {
    let t = true;
    try {
      this[Ht](null, I.openSync(this[U], "r")), t = false;
    } finally {
      t && this[H]();
    }
  }
  [zt]() {
    let t = true;
    try {
      if (!this[J]) {
        this[J] = true;
        do {
          let e = this[Fi](), i = e.length === 0 ? 0 : I.readSync(this[m], e, 0, e.length, null);
          if (!this[ki](i, e))
            break;
        } while (true);
        this[J] = false;
      }
      t = false;
    } finally {
      t && this[H]();
    }
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = undefined, I.closeSync(t), this.emit("close");
    }
  }
};
var tt = class extends Vr {
  readable = false;
  writable = true;
  [bt] = false;
  [gt] = false;
  [ee] = false;
  [Y] = [];
  [Fe] = false;
  [U];
  [se];
  [ot];
  [m];
  [Me];
  [j];
  [Ni] = false;
  [nt];
  constructor(t, e) {
    e = e || {}, super(e), this[U] = t, this[m] = typeof e.fd == "number" ? e.fd : undefined, this[se] = e.mode === undefined ? 438 : e.mode, this[nt] = typeof e.start == "number" ? e.start : undefined, this[ot] = typeof e.autoClose == "boolean" ? e.autoClose : true;
    let i = this[nt] !== undefined ? "r+" : "w";
    this[Me] = e.flags === undefined, this[j] = e.flags === undefined ? i : e.flags, this[m] === undefined && this[ht]();
  }
  emit(t, ...e) {
    if (t === "error") {
      if (this[bt])
        return false;
      this[bt] = true;
    }
    return super.emit(t, ...e);
  }
  get fd() {
    return this[m];
  }
  get path() {
    return this[U];
  }
  [Ut](t) {
    this[H](), this[gt] = true, this.emit("error", t);
  }
  [ht]() {
    I.open(this[U], this[j], this[se], (t, e) => this[Ht](t, e));
  }
  [Ht](t, e) {
    this[Me] && this[j] === "r+" && t && t.code === "ENOENT" ? (this[j] = "w", this[ht]()) : t ? this[Ut](t) : (this[m] = e, this.emit("open", e), this[gt] || this[Di]());
  }
  end(t, e) {
    return t && this.write(t, e), this[ee] = true, !this[gt] && !this[Y].length && typeof this[m] == "number" && this[Pt](null, 0), this;
  }
  write(t, e) {
    return typeof t == "string" && (t = Buffer.from(t, e)), this[ee] ? (this.emit("error", new Error("write() after end()")), false) : this[m] === undefined || this[gt] || this[Y].length ? (this[Y].push(t), this[Fe] = true, false) : (this[gt] = true, this[ve](t), true);
  }
  [ve](t) {
    I.write(this[m], t, 0, t.length, this[nt], (e, i) => this[Pt](e, i));
  }
  [Pt](t, e) {
    t ? this[Ut](t) : (this[nt] !== undefined && typeof e == "number" && (this[nt] += e), this[Y].length ? this[Di]() : (this[gt] = false, this[ee] && !this[Ni] ? (this[Ni] = true, this[H](), this.emit("finish")) : this[Fe] && (this[Fe] = false, this.emit("drain"))));
  }
  [Di]() {
    if (this[Y].length === 0)
      this[ee] && this[Pt](null, 0);
    else if (this[Y].length === 1)
      this[ve](this[Y].pop());
    else {
      let t = this[Y];
      this[Y] = [], $r(this[m], t, this[nt], (e, i) => this[Pt](e, i));
    }
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = undefined, I.close(t, (e) => e ? this.emit("error", e) : this.emit("close"));
    }
  }
};
var Wt = class extends tt {
  [ht]() {
    let t;
    if (this[Me] && this[j] === "r+")
      try {
        t = I.openSync(this[U], this[j], this[se]);
      } catch (e) {
        if (e?.code === "ENOENT")
          return this[j] = "w", this[ht]();
        throw e;
      }
    else
      t = I.openSync(this[U], this[j], this[se]);
    this[Ht](null, t);
  }
  [H]() {
    if (this[ot] && typeof this[m] == "number") {
      let t = this[m];
      this[m] = undefined, I.closeSync(t), this.emit("close");
    }
  }
  [ve](t) {
    let e = true;
    try {
      this[Pt](null, I.writeSync(this[m], t, 0, t.length, this[nt])), e = false;
    } finally {
      if (e)
        try {
          this[H]();
        } catch {}
    }
  }
};
var Xr = new Map([["C", "cwd"], ["f", "file"], ["z", "gzip"], ["P", "preservePaths"], ["U", "unlink"], ["strip-components", "strip"], ["stripComponents", "strip"], ["keep-newer", "newer"], ["keepNewer", "newer"], ["keep-newer-files", "newer"], ["keepNewerFiles", "newer"], ["k", "keep"], ["keep-existing", "keep"], ["keepExisting", "keep"], ["m", "noMtime"], ["no-mtime", "noMtime"], ["p", "preserveOwner"], ["L", "follow"], ["h", "follow"], ["onentry", "onReadEntry"]]);
var As = (s) => !!s.sync && !!s.file;
var Is = (s) => !s.sync && !!s.file;
var Cs = (s) => !!s.sync && !s.file;
var ks = (s) => !s.sync && !s.file;
var Fs = (s) => !!s.file;
var qr = (s) => {
  let t = Xr.get(s);
  return t || s;
};
var re = (s = {}) => {
  if (!s)
    return {};
  let t = {};
  for (let [e, i] of Object.entries(s)) {
    let r = qr(e);
    t[r] = i;
  }
  return t.chmod === undefined && t.noChmod === false && (t.chmod = true), delete t.noChmod, t;
};
var K = (s, t, e, i, r) => Object.assign((n = [], o, h) => {
  Array.isArray(n) && (o = n, n = {}), typeof o == "function" && (h = o, o = undefined), o = o ? Array.from(o) : [];
  let a = re(n);
  if (r?.(a, o), As(a)) {
    if (typeof h == "function")
      throw new TypeError("callback not supported for sync tar functions");
    return s(a, o);
  } else if (Is(a)) {
    let l = t(a, o);
    return h ? l.then(() => h(), h) : l;
  } else if (Cs(a)) {
    if (typeof h == "function")
      throw new TypeError("callback not supported for sync tar functions");
    return e(a, o);
  } else if (ks(a)) {
    if (typeof h == "function")
      throw new TypeError("callback only supported with file option");
    return i(a, o);
  }
  throw new Error("impossible options??");
}, { syncFile: s, asyncFile: t, syncNoFile: e, asyncNoFile: i, validate: r });
var Jr = Qr.constants || { ZLIB_VERNUM: 4736 };
var M = Object.freeze(Object.assign(Object.create(null), { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_VERSION_ERROR: -6, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, DEFLATE: 1, INFLATE: 2, GZIP: 3, GUNZIP: 4, DEFLATERAW: 5, INFLATERAW: 6, UNZIP: 7, BROTLI_DECODE: 8, BROTLI_ENCODE: 9, Z_MIN_WINDOWBITS: 8, Z_MAX_WINDOWBITS: 15, Z_DEFAULT_WINDOWBITS: 15, Z_MIN_CHUNK: 64, Z_MAX_CHUNK: 1 / 0, Z_DEFAULT_CHUNK: 16384, Z_MIN_MEMLEVEL: 1, Z_MAX_MEMLEVEL: 9, Z_DEFAULT_MEMLEVEL: 8, Z_MIN_LEVEL: -1, Z_MAX_LEVEL: 9, Z_DEFAULT_LEVEL: -1, BROTLI_OPERATION_PROCESS: 0, BROTLI_OPERATION_FLUSH: 1, BROTLI_OPERATION_FINISH: 2, BROTLI_OPERATION_EMIT_METADATA: 3, BROTLI_MODE_GENERIC: 0, BROTLI_MODE_TEXT: 1, BROTLI_MODE_FONT: 2, BROTLI_DEFAULT_MODE: 0, BROTLI_MIN_QUALITY: 0, BROTLI_MAX_QUALITY: 11, BROTLI_DEFAULT_QUALITY: 11, BROTLI_MIN_WINDOW_BITS: 10, BROTLI_MAX_WINDOW_BITS: 24, BROTLI_LARGE_MAX_WINDOW_BITS: 30, BROTLI_DEFAULT_WINDOW: 22, BROTLI_MIN_INPUT_BLOCK_BITS: 16, BROTLI_MAX_INPUT_BLOCK_BITS: 24, BROTLI_PARAM_MODE: 0, BROTLI_PARAM_QUALITY: 1, BROTLI_PARAM_LGWIN: 2, BROTLI_PARAM_LGBLOCK: 3, BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4, BROTLI_PARAM_SIZE_HINT: 5, BROTLI_PARAM_LARGE_WINDOW: 6, BROTLI_PARAM_NPOSTFIX: 7, BROTLI_PARAM_NDIRECT: 8, BROTLI_DECODER_RESULT_ERROR: 0, BROTLI_DECODER_RESULT_SUCCESS: 1, BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0, BROTLI_DECODER_PARAM_LARGE_WINDOW: 1, BROTLI_DECODER_NO_ERROR: 0, BROTLI_DECODER_SUCCESS: 1, BROTLI_DECODER_NEEDS_MORE_INPUT: 2, BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1, BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2, BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4, BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5, BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6, BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7, BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9, BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10, BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11, BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12, BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13, BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14, BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15, BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16, BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19, BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21, BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22, BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26, BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27, BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30, BROTLI_DECODER_ERROR_UNREACHABLE: -31 }, Jr));
var jr = Ot.concat;
var Ms = Object.getOwnPropertyDescriptor(Ot, "concat");
var tn = (s) => s;
var Mi = Ms?.writable === true || Ms?.set !== undefined ? (s) => {
  Ot.concat = s ? tn : jr;
} : (s) => {};
var Tt = Symbol("_superWrite");
var Gt = class extends Error {
  code;
  errno;
  constructor(t, e) {
    super("zlib: " + t.message, { cause: t }), this.code = t.code, this.errno = t.errno, this.code || (this.code = "ZLIB_ERROR"), this.message = "zlib: " + t.message, Error.captureStackTrace(this, e ?? this.constructor);
  }
  get name() {
    return "ZlibError";
  }
};
var Bi = Symbol("flushFlag");
var ne = class extends A {
  #t = false;
  #i = false;
  #s;
  #n;
  #r;
  #e;
  #o;
  get sawError() {
    return this.#t;
  }
  get handle() {
    return this.#e;
  }
  get flushFlag() {
    return this.#s;
  }
  constructor(t, e) {
    if (!t || typeof t != "object")
      throw new TypeError("invalid options for ZlibBase constructor");
    if (super(t), this.#s = t.flush ?? 0, this.#n = t.finishFlush ?? 0, this.#r = t.fullFlushFlag ?? 0, typeof vs[e] != "function")
      throw new TypeError("Compression method not supported: " + e);
    try {
      this.#e = new vs[e](t);
    } catch (i) {
      throw new Gt(i, this.constructor);
    }
    this.#o = (i) => {
      this.#t || (this.#t = true, this.close(), this.emit("error", i));
    }, this.#e?.on("error", (i) => this.#o(new Gt(i))), this.once("end", () => this.close);
  }
  close() {
    this.#e && (this.#e.close(), this.#e = undefined, this.emit("close"));
  }
  reset() {
    if (!this.#t)
      return Pi(this.#e, "zlib binding closed"), this.#e.reset?.();
  }
  flush(t) {
    this.ended || (typeof t != "number" && (t = this.#r), this.write(Object.assign(Ot.alloc(0), { [Bi]: t })));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = undefined, t = undefined), typeof e == "function" && (i = e, e = undefined), t && (e ? this.write(t, e) : this.write(t)), this.flush(this.#n), this.#i = true, super.end(i);
  }
  get ended() {
    return this.#i;
  }
  [Tt](t) {
    return super.write(t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = "utf8"), typeof t == "string" && (t = Ot.from(t, e)), this.#t)
      return;
    Pi(this.#e, "zlib binding closed");
    let r = this.#e._handle, n = r.close;
    r.close = () => {};
    let o = this.#e.close;
    this.#e.close = () => {}, Mi(true);
    let h;
    try {
      let l = typeof t[Bi] == "number" ? t[Bi] : this.#s;
      h = this.#e._processChunk(t, l), Mi(false);
    } catch (l) {
      Mi(false), this.#o(new Gt(l, this.write));
    } finally {
      this.#e && (this.#e._handle = r, r.close = n, this.#e.close = o, this.#e.removeAllListeners("error"));
    }
    this.#e && this.#e.on("error", (l) => this.#o(new Gt(l, this.write)));
    let a;
    if (h)
      if (Array.isArray(h) && h.length > 0) {
        let l = h[0];
        a = this[Tt](Ot.from(l));
        for (let c = 1;c < h.length; c++)
          a = this[Tt](h[c]);
      } else
        a = this[Tt](Ot.from(h));
    return i && i(), a;
  }
};
var Pe = class extends ne {
  #t;
  #i;
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.Z_NO_FLUSH, t.finishFlush = t.finishFlush || M.Z_FINISH, t.fullFlushFlag = M.Z_FULL_FLUSH, super(t, e), this.#t = t.level, this.#i = t.strategy;
  }
  params(t, e) {
    if (!this.sawError) {
      if (!this.handle)
        throw new Error("cannot switch params when binding is closed");
      if (!this.handle.params)
        throw new Error("not supported in this implementation");
      if (this.#t !== t || this.#i !== e) {
        this.flush(M.Z_SYNC_FLUSH), Pi(this.handle, "zlib binding closed");
        let i = this.handle.flush;
        this.handle.flush = (r, n) => {
          typeof r == "function" && (n = r, r = this.flushFlag), this.flush(r), n?.();
        };
        try {
          this.handle.params(t, e);
        } finally {
          this.handle.flush = i;
        }
        this.handle && (this.#t = t, this.#i = e);
      }
    }
  }
};
var ze = class extends Pe {
  #t;
  constructor(t) {
    super(t, "Gzip"), this.#t = t && !!t.portable;
  }
  [Tt](t) {
    return this.#t ? (this.#t = false, t[9] = 255, super[Tt](t)) : super[Tt](t);
  }
};
var Ue = class extends Pe {
  constructor(t) {
    super(t, "Unzip");
  }
};
var He = class extends ne {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.BROTLI_OPERATION_PROCESS, t.finishFlush = t.finishFlush || M.BROTLI_OPERATION_FINISH, t.fullFlushFlag = M.BROTLI_OPERATION_FLUSH, super(t, e);
  }
};
var We = class extends He {
  constructor(t) {
    super(t, "BrotliCompress");
  }
};
var Ge = class extends He {
  constructor(t) {
    super(t, "BrotliDecompress");
  }
};
var Ze = class extends ne {
  constructor(t, e) {
    t = t || {}, t.flush = t.flush || M.ZSTD_e_continue, t.finishFlush = t.finishFlush || M.ZSTD_e_end, t.fullFlushFlag = M.ZSTD_e_flush, super(t, e);
  }
};
var Ye = class extends Ze {
  constructor(t) {
    super(t, "ZstdCompress");
  }
};
var Ke = class extends Ze {
  constructor(t) {
    super(t, "ZstdDecompress");
  }
};
var Bs = (s, t) => {
  if (Number.isSafeInteger(s))
    s < 0 ? rn(s, t) : sn(s, t);
  else
    throw Error("cannot encode number outside of javascript safe integer range");
  return t;
};
var sn = (s, t) => {
  t[0] = 128;
  for (var e = t.length;e > 1; e--)
    t[e - 1] = s & 255, s = Math.floor(s / 256);
};
var rn = (s, t) => {
  t[0] = 255;
  var e = false;
  s = s * -1;
  for (var i = t.length;i > 1; i--) {
    var r = s & 255;
    s = Math.floor(s / 256), e ? t[i - 1] = zs(r) : r === 0 ? t[i - 1] = 0 : (e = true, t[i - 1] = Us(r));
  }
};
var Ps = (s) => {
  let t = s[0], e = t === 128 ? on(s.subarray(1, s.length)) : t === 255 ? nn(s) : null;
  if (e === null)
    throw Error("invalid base256 encoding");
  if (!Number.isSafeInteger(e))
    throw Error("parsed number outside of javascript safe integer range");
  return e;
};
var nn = (s) => {
  for (var t = s.length, e = 0, i = false, r = t - 1;r > -1; r--) {
    var n = Number(s[r]), o;
    i ? o = zs(n) : n === 0 ? o = n : (i = true, o = Us(n)), o !== 0 && (e -= o * Math.pow(256, t - r - 1));
  }
  return e;
};
var on = (s) => {
  for (var t = s.length, e = 0, i = t - 1;i > -1; i--) {
    var r = Number(s[i]);
    r !== 0 && (e += r * Math.pow(256, t - i - 1));
  }
  return e;
};
var zs = (s) => (255 ^ s) & 255;
var Us = (s) => (255 ^ s) + 1 & 255;
var zi = {};
Mr(zi, { code: () => Ve, isCode: () => oe, isName: () => an, name: () => he });
var oe = (s) => he.has(s);
var an = (s) => Ve.has(s);
var he = new Map([["0", "File"], ["", "OldFile"], ["1", "Link"], ["2", "SymbolicLink"], ["3", "CharacterDevice"], ["4", "BlockDevice"], ["5", "Directory"], ["6", "FIFO"], ["7", "ContiguousFile"], ["g", "GlobalExtendedHeader"], ["x", "ExtendedHeader"], ["A", "SolarisACL"], ["D", "GNUDumpDir"], ["I", "Inode"], ["K", "NextFileHasLongLinkpath"], ["L", "NextFileHasLongPath"], ["M", "ContinuationFile"], ["N", "OldGnuLongPath"], ["S", "SparseFile"], ["V", "TapeVolumeHeader"], ["X", "OldExtendedHeader"]]);
var Ve = new Map(Array.from(he).map((s) => [s[1], s[0]]));
var k = class {
  cksumValid = false;
  needPax = false;
  nullBlock = false;
  block;
  path;
  mode;
  uid;
  gid;
  size;
  cksum;
  #t = "Unsupported";
  linkpath;
  uname;
  gname;
  devmaj = 0;
  devmin = 0;
  atime;
  ctime;
  mtime;
  charset;
  comment;
  constructor(t, e = 0, i, r) {
    Buffer.isBuffer(t) ? this.decode(t, e || 0, i, r) : t && this.#i(t);
  }
  decode(t, e, i, r) {
    if (e || (e = 0), !t || !(t.length >= e + 512))
      throw new Error("need 512 bytes for header");
    this.path = i?.path ?? xt(t, e, 100), this.mode = i?.mode ?? r?.mode ?? at(t, e + 100, 8), this.uid = i?.uid ?? r?.uid ?? at(t, e + 108, 8), this.gid = i?.gid ?? r?.gid ?? at(t, e + 116, 8), this.size = i?.size ?? r?.size ?? at(t, e + 124, 12), this.mtime = i?.mtime ?? r?.mtime ?? Ui(t, e + 136, 12), this.cksum = at(t, e + 148, 12), r && this.#i(r, true), i && this.#i(i);
    let n = xt(t, e + 156, 1);
    if (oe(n) && (this.#t = n || "0"), this.#t === "0" && this.path.slice(-1) === "/" && (this.#t = "5"), this.#t === "5" && (this.size = 0), this.linkpath = xt(t, e + 157, 100), t.subarray(e + 257, e + 265).toString() === "ustar\x0000")
      if (this.uname = i?.uname ?? r?.uname ?? xt(t, e + 265, 32), this.gname = i?.gname ?? r?.gname ?? xt(t, e + 297, 32), this.devmaj = i?.devmaj ?? r?.devmaj ?? at(t, e + 329, 8) ?? 0, this.devmin = i?.devmin ?? r?.devmin ?? at(t, e + 337, 8) ?? 0, t[e + 475] !== 0) {
        let h = xt(t, e + 345, 155);
        this.path = h + "/" + this.path;
      } else {
        let h = xt(t, e + 345, 130);
        h && (this.path = h + "/" + this.path), this.atime = i?.atime ?? r?.atime ?? Ui(t, e + 476, 12), this.ctime = i?.ctime ?? r?.ctime ?? Ui(t, e + 488, 12);
      }
    let o = 256;
    for (let h = e;h < e + 148; h++)
      o += t[h];
    for (let h = e + 156;h < e + 512; h++)
      o += t[h];
    this.cksumValid = o === this.cksum, this.cksum === undefined && o === 256 && (this.nullBlock = true);
  }
  #i(t, e = false) {
    Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "path" && e || i === "linkpath" && e || i === "global"))));
  }
  encode(t, e = 0) {
    if (t || (t = this.block = Buffer.alloc(512)), this.#t === "Unsupported" && (this.#t = "0"), !(t.length >= e + 512))
      throw new Error("need 512 bytes for header");
    let i = this.ctime || this.atime ? 130 : 155, r = ln(this.path || "", i), n = r[0], o = r[1];
    this.needPax = !!r[2], this.needPax = Lt(t, e, 100, n) || this.needPax, this.needPax = lt(t, e + 100, 8, this.mode) || this.needPax, this.needPax = lt(t, e + 108, 8, this.uid) || this.needPax, this.needPax = lt(t, e + 116, 8, this.gid) || this.needPax, this.needPax = lt(t, e + 124, 12, this.size) || this.needPax, this.needPax = Hi(t, e + 136, 12, this.mtime) || this.needPax, t[e + 156] = Number(this.#t.codePointAt(0)), this.needPax = Lt(t, e + 157, 100, this.linkpath) || this.needPax, t.write("ustar\x0000", e + 257, 8), this.needPax = Lt(t, e + 265, 32, this.uname) || this.needPax, this.needPax = Lt(t, e + 297, 32, this.gname) || this.needPax, this.needPax = lt(t, e + 329, 8, this.devmaj) || this.needPax, this.needPax = lt(t, e + 337, 8, this.devmin) || this.needPax, this.needPax = Lt(t, e + 345, i, o) || this.needPax, t[e + 475] !== 0 ? this.needPax = Lt(t, e + 345, 155, o) || this.needPax : (this.needPax = Lt(t, e + 345, 130, o) || this.needPax, this.needPax = Hi(t, e + 476, 12, this.atime) || this.needPax, this.needPax = Hi(t, e + 488, 12, this.ctime) || this.needPax);
    let h = 256;
    for (let a = e;a < e + 148; a++)
      h += t[a];
    for (let a = e + 156;a < e + 512; a++)
      h += t[a];
    return this.cksum = h, lt(t, e + 148, 8, this.cksum), this.cksumValid = true, this.needPax;
  }
  get type() {
    return this.#t === "Unsupported" ? this.#t : he.get(this.#t);
  }
  get typeKey() {
    return this.#t;
  }
  set type(t) {
    let e = String(Ve.get(t));
    if (oe(e) || e === "Unsupported")
      this.#t = e;
    else if (oe(t))
      this.#t = t;
    else
      throw new TypeError("invalid entry type: " + t);
  }
};
var ln = (s, t) => {
  let i = s, r = "", n, o = Zt.parse(s).root || ".";
  if (Buffer.byteLength(i) < 100)
    n = [i, r, false];
  else {
    r = Zt.dirname(i), i = Zt.basename(i);
    do
      Buffer.byteLength(i) <= 100 && Buffer.byteLength(r) <= t ? n = [i, r, false] : Buffer.byteLength(i) > 100 && Buffer.byteLength(r) <= t ? n = [i.slice(0, 99), r, true] : (i = Zt.join(Zt.basename(r), i), r = Zt.dirname(r));
    while (r !== o && n === undefined);
    n || (n = [s.slice(0, 99), "", true]);
  }
  return n;
};
var xt = (s, t, e) => s.subarray(t, t + e).toString("utf8").replace(/\0.*/, "");
var Ui = (s, t, e) => cn(at(s, t, e));
var cn = (s) => s === undefined ? undefined : new Date(s * 1000);
var at = (s, t, e) => Number(s[t]) & 128 ? Ps(s.subarray(t, t + e)) : dn(s, t, e);
var fn = (s) => isNaN(s) ? undefined : s;
var dn = (s, t, e) => fn(parseInt(s.subarray(t, t + e).toString("utf8").replace(/\0.*$/, "").trim(), 8));
var un = { 12: 8589934591, 8: 2097151 };
var lt = (s, t, e, i) => i === undefined ? false : i > un[e] || i < 0 ? (Bs(i, s.subarray(t, t + e)), true) : (mn(s, t, e, i), false);
var mn = (s, t, e, i) => s.write(pn(i, e), t, e, "ascii");
var pn = (s, t) => En(Math.floor(s).toString(8), t);
var En = (s, t) => (s.length === t - 1 ? s : new Array(t - s.length - 1).join("0") + s + " ") + "\x00";
var Hi = (s, t, e, i) => i === undefined ? false : lt(s, t, e, i.getTime() / 1000);
var wn = new Array(156).join("\x00");
var Lt = (s, t, e, i) => i === undefined ? false : (s.write(i + wn, t, e, "utf8"), i.length !== Buffer.byteLength(i) || i.length > e);
var ct = class s {
  atime;
  mtime;
  ctime;
  charset;
  comment;
  gid;
  uid;
  gname;
  uname;
  linkpath;
  dev;
  ino;
  nlink;
  path;
  size;
  mode;
  global;
  constructor(t, e = false) {
    this.atime = t.atime, this.charset = t.charset, this.comment = t.comment, this.ctime = t.ctime, this.dev = t.dev, this.gid = t.gid, this.global = e, this.gname = t.gname, this.ino = t.ino, this.linkpath = t.linkpath, this.mtime = t.mtime, this.nlink = t.nlink, this.path = t.path, this.size = t.size, this.uid = t.uid, this.uname = t.uname;
  }
  encode() {
    let t = this.encodeBody();
    if (t === "")
      return Buffer.allocUnsafe(0);
    let e = Buffer.byteLength(t), i = 512 * Math.ceil(1 + e / 512), r = Buffer.allocUnsafe(i);
    for (let n = 0;n < 512; n++)
      r[n] = 0;
    new k({ path: ("PaxHeader/" + Sn(this.path ?? "")).slice(0, 99), mode: this.mode || 420, uid: this.uid, gid: this.gid, size: e, mtime: this.mtime, type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader", linkpath: "", uname: this.uname || "", gname: this.gname || "", devmaj: 0, devmin: 0, atime: this.atime, ctime: this.ctime }).encode(r), r.write(t, 512, e, "utf8");
    for (let n = e + 512;n < r.length; n++)
      r[n] = 0;
    return r;
  }
  encodeBody() {
    return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
  }
  encodeField(t) {
    if (this[t] === undefined)
      return "";
    let e = this[t], i = e instanceof Date ? e.getTime() / 1000 : e, r = " " + (t === "dev" || t === "ino" || t === "nlink" ? "SCHILY." : "") + t + "=" + i + `
`, n = Buffer.byteLength(r), o = Math.floor(Math.log(n) / Math.log(10)) + 1;
    return n + o >= Math.pow(10, o) && (o += 1), o + n + r;
  }
  static parse(t, e, i = false) {
    return new s(yn(Rn(t), e), i);
  }
};
var yn = (s2, t) => t ? Object.assign({}, t, s2) : s2;
var Rn = (s2) => s2.replace(/\n$/, "").split(`
`).reduce(gn, Object.create(null));
var gn = (s2, t) => {
  let e = parseInt(t, 10);
  if (e !== Buffer.byteLength(t) + 1)
    return s2;
  t = t.slice((e + " ").length);
  let i = t.split("="), r = i.shift();
  if (!r)
    return s2;
  let n = r.replace(/^SCHILY\.(dev|ino|nlink)/, "$1"), o = i.join("=");
  return s2[n] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(n) ? new Date(Number(o) * 1000) : /^[0-9]+$/.test(o) ? +o : o, s2;
};
var bn = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var f = bn !== "win32" ? (s2) => s2 : (s2) => s2 && s2.replaceAll(/\\/g, "/");
var Yt = class extends A {
  extended;
  globalExtended;
  header;
  startBlockSize;
  blockRemain;
  remain;
  type;
  meta = false;
  ignore = false;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  size = 0;
  mtime;
  atime;
  ctime;
  linkpath;
  dev;
  ino;
  nlink;
  invalid = false;
  absolute;
  unsupported = false;
  constructor(t, e, i) {
    switch (super({}), this.pause(), this.extended = e, this.globalExtended = i, this.header = t, this.remain = t.size ?? 0, this.startBlockSize = 512 * Math.ceil(this.remain / 512), this.blockRemain = this.startBlockSize, this.type = t.type, this.type) {
      case "File":
      case "OldFile":
      case "Link":
      case "SymbolicLink":
      case "CharacterDevice":
      case "BlockDevice":
      case "Directory":
      case "FIFO":
      case "ContiguousFile":
      case "GNUDumpDir":
        break;
      case "NextFileHasLongLinkpath":
      case "NextFileHasLongPath":
      case "OldGnuLongPath":
      case "GlobalExtendedHeader":
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this.meta = true;
        break;
      default:
        this.ignore = true;
    }
    if (!t.path)
      throw new Error("no path provided for tar.ReadEntry");
    this.path = f(t.path), this.mode = t.mode, this.mode && (this.mode = this.mode & 4095), this.uid = t.uid, this.gid = t.gid, this.uname = t.uname, this.gname = t.gname, this.size = this.remain, this.mtime = t.mtime, this.atime = t.atime, this.ctime = t.ctime, this.linkpath = t.linkpath ? f(t.linkpath) : undefined, this.uname = t.uname, this.gname = t.gname, e && this.#t(e), i && this.#t(i, true);
  }
  write(t) {
    let e = t.length;
    if (e > this.blockRemain)
      throw new Error("writing more to entry than is appropriate");
    let i = this.remain, r = this.blockRemain;
    return this.remain = Math.max(0, i - e), this.blockRemain = Math.max(0, r - e), this.ignore ? true : i >= e ? super.write(t) : super.write(t.subarray(0, i));
  }
  #t(t, e = false) {
    t.path && (t.path = f(t.path)), t.linkpath && (t.linkpath = f(t.linkpath)), Object.assign(this, Object.fromEntries(Object.entries(t).filter(([i, r]) => !(r == null || i === "path" && e))));
  }
};
var Nt = (s2, t, e, i = {}) => {
  s2.file && (i.file = s2.file), s2.cwd && (i.cwd = s2.cwd), i.code = e instanceof Error && e.code || t, i.tarCode = t, !s2.strict && i.recoverable !== false ? (e instanceof Error && (i = Object.assign(e, i), e = e.message), s2.emit("warn", t, e, i)) : e instanceof Error ? s2.emit("error", Object.assign(e, i)) : s2.emit("error", Object.assign(new Error(`${t}: ${e}`), i));
};
var On = 1024 * 1024;
var Ki = Buffer.from([31, 139]);
var Vi = Buffer.from([40, 181, 47, 253]);
var Tn = Math.max(Ki.length, Vi.length);
var B = Symbol("state");
var Dt = Symbol("writeEntry");
var et = Symbol("readEntry");
var Wi = Symbol("nextEntry");
var Hs = Symbol("processEntry");
var V = Symbol("extendedHeader");
var ae = Symbol("globalExtendedHeader");
var ft = Symbol("meta");
var Ws = Symbol("emitMeta");
var p = Symbol("buffer");
var it = Symbol("queue");
var dt = Symbol("ended");
var Gi = Symbol("emittedEnd");
var At = Symbol("emit");
var y = Symbol("unzip");
var $e = Symbol("consumeChunk");
var Xe = Symbol("consumeChunkSub");
var Zi = Symbol("consumeBody");
var Gs = Symbol("consumeMeta");
var Zs = Symbol("consumeHeader");
var le = Symbol("consuming");
var Yi = Symbol("bufferConcat");
var qe = Symbol("maybeEnd");
var Kt = Symbol("writing");
var ut = Symbol("aborted");
var Qe = Symbol("onDone");
var It = Symbol("sawValidEntry");
var Je = Symbol("sawNullBlock");
var je = Symbol("sawEOF");
var Ys = Symbol("closeStream");
var xn = () => true;
var st = class extends _n {
  file;
  strict;
  maxMetaEntrySize;
  filter;
  brotli;
  zstd;
  writable = true;
  readable = false;
  [it] = [];
  [p];
  [et];
  [Dt];
  [B] = "begin";
  [ft] = "";
  [V];
  [ae];
  [dt] = false;
  [y];
  [ut] = false;
  [It];
  [Je] = false;
  [je] = false;
  [Kt] = false;
  [le] = false;
  [Gi] = false;
  constructor(t = {}) {
    super(), this.file = t.file || "", this.on(Qe, () => {
      (this[B] === "begin" || this[It] === false) && this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
    }), t.ondone ? this.on(Qe, t.ondone) : this.on(Qe, () => {
      this.emit("prefinish"), this.emit("finish"), this.emit("end");
    }), this.strict = !!t.strict, this.maxMetaEntrySize = t.maxMetaEntrySize || On, this.filter = typeof t.filter == "function" ? t.filter : xn;
    let e = t.file && (t.file.endsWith(".tar.br") || t.file.endsWith(".tbr"));
    this.brotli = !(t.gzip || t.zstd) && t.brotli !== undefined ? t.brotli : e ? undefined : false;
    let i = t.file && (t.file.endsWith(".tar.zst") || t.file.endsWith(".tzst"));
    this.zstd = !(t.gzip || t.brotli) && t.zstd !== undefined ? t.zstd : i ? true : undefined, this.on("end", () => this[Ys]()), typeof t.onwarn == "function" && this.on("warn", t.onwarn), typeof t.onReadEntry == "function" && this.on("entry", t.onReadEntry);
  }
  warn(t, e, i = {}) {
    Nt(this, t, e, i);
  }
  [Zs](t, e) {
    this[It] === undefined && (this[It] = false);
    let i;
    try {
      i = new k(t, e, this[V], this[ae]);
    } catch (r) {
      return this.warn("TAR_ENTRY_INVALID", r);
    }
    if (i.nullBlock)
      this[Je] ? (this[je] = true, this[B] === "begin" && (this[B] = "header"), this[At]("eof")) : (this[Je] = true, this[At]("nullBlock"));
    else if (this[Je] = false, !i.cksumValid)
      this.warn("TAR_ENTRY_INVALID", "checksum failure", { header: i });
    else if (!i.path)
      this.warn("TAR_ENTRY_INVALID", "path is required", { header: i });
    else {
      let r = i.type;
      if (/^(Symbolic)?Link$/.test(r) && !i.linkpath)
        this.warn("TAR_ENTRY_INVALID", "linkpath required", { header: i });
      else if (!/^(Symbolic)?Link$/.test(r) && !/^(Global)?ExtendedHeader$/.test(r) && i.linkpath)
        this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header: i });
      else {
        let n = this[Dt] = new Yt(i, this[V], this[ae]);
        if (!this[It])
          if (n.remain) {
            let o = () => {
              n.invalid || (this[It] = true);
            };
            n.on("end", o);
          } else
            this[It] = true;
        n.meta ? n.size > this.maxMetaEntrySize ? (n.ignore = true, this[At]("ignoredEntry", n), this[B] = "ignore", n.resume()) : n.size > 0 && (this[ft] = "", n.on("data", (o) => this[ft] += o), this[B] = "meta") : (this[V] = undefined, n.ignore = n.ignore || !this.filter(n.path, n), n.ignore ? (this[At]("ignoredEntry", n), this[B] = n.remain ? "ignore" : "header", n.resume()) : (n.remain ? this[B] = "body" : (this[B] = "header", n.end()), this[et] ? this[it].push(n) : (this[it].push(n), this[Wi]())));
      }
    }
  }
  [Ys]() {
    queueMicrotask(() => this.emit("close"));
  }
  [Hs](t) {
    let e = true;
    if (!t)
      this[et] = undefined, e = false;
    else if (Array.isArray(t)) {
      let [i, ...r] = t;
      this.emit(i, ...r);
    } else
      this[et] = t, this.emit("entry", t), t.emittedEnd || (t.on("end", () => this[Wi]()), e = false);
    return e;
  }
  [Wi]() {
    do
      ;
    while (this[Hs](this[it].shift()));
    if (this[it].length === 0) {
      let t = this[et];
      !t || t.flowing || t.size === t.remain ? this[Kt] || this.emit("drain") : t.once("drain", () => this.emit("drain"));
    }
  }
  [Zi](t, e) {
    let i = this[Dt];
    if (!i)
      throw new Error("attempt to consume body without entry??");
    let r = i.blockRemain ?? 0, n = r >= t.length && e === 0 ? t : t.subarray(e, e + r);
    return i.write(n), i.blockRemain || (this[B] = "header", this[Dt] = undefined, i.end()), n.length;
  }
  [Gs](t, e) {
    let i = this[Dt], r = this[Zi](t, e);
    return !this[Dt] && i && this[Ws](i), r;
  }
  [At](t, e, i) {
    this[it].length === 0 && !this[et] ? this.emit(t, e, i) : this[it].push([t, e, i]);
  }
  [Ws](t) {
    switch (this[At]("meta", this[ft]), t.type) {
      case "ExtendedHeader":
      case "OldExtendedHeader":
        this[V] = ct.parse(this[ft], this[V], false);
        break;
      case "GlobalExtendedHeader":
        this[ae] = ct.parse(this[ft], this[ae], true);
        break;
      case "NextFileHasLongPath":
      case "OldGnuLongPath": {
        let e = this[V] ?? Object.create(null);
        this[V] = e, e.path = this[ft].replace(/\0.*/, "");
        break;
      }
      case "NextFileHasLongLinkpath": {
        let e = this[V] || Object.create(null);
        this[V] = e, e.linkpath = this[ft].replace(/\0.*/, "");
        break;
      }
      default:
        throw new Error("unknown meta: " + t.type);
    }
  }
  abort(t) {
    this[ut] = true, this.emit("abort", t), this.warn("TAR_ABORT", t, { recoverable: false });
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = undefined), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this[ut])
      return i?.(), false;
    if ((this[y] === undefined || this.brotli === undefined && this[y] === false) && t) {
      if (this[p] && (t = Buffer.concat([this[p], t]), this[p] = undefined), t.length < Tn)
        return this[p] = t, i?.(), true;
      for (let a = 0;this[y] === undefined && a < Ki.length; a++)
        t[a] !== Ki[a] && (this[y] = false);
      let o = false;
      if (this[y] === false && this.zstd !== false) {
        o = true;
        for (let a = 0;a < Vi.length; a++)
          if (t[a] !== Vi[a]) {
            o = false;
            break;
          }
      }
      let h = this.brotli === undefined && !o;
      if (this[y] === false && h)
        if (t.length < 512)
          if (this[dt])
            this.brotli = true;
          else
            return this[p] = t, i?.(), true;
        else
          try {
            new k(t.subarray(0, 512)), this.brotli = false;
          } catch {
            this.brotli = true;
          }
      if (this[y] === undefined || this[y] === false && (this.brotli || o)) {
        let a = this[dt];
        this[dt] = false, this[y] = this[y] === undefined ? new Ue({}) : o ? new Ke({}) : new Ge({}), this[y].on("data", (c) => this[$e](c)), this[y].on("error", (c) => this.abort(c)), this[y].on("end", () => {
          this[dt] = true, this[$e]();
        }), this[Kt] = true;
        let l = !!this[y][a ? "end" : "write"](t);
        return this[Kt] = false, i?.(), l;
      }
    }
    this[Kt] = true, this[y] ? this[y].write(t) : this[$e](t), this[Kt] = false;
    let n = this[it].length > 0 ? false : this[et] ? this[et].flowing : true;
    return !n && this[it].length === 0 && this[et]?.once("drain", () => this.emit("drain")), i?.(), n;
  }
  [Yi](t) {
    t && !this[ut] && (this[p] = this[p] ? Buffer.concat([this[p], t]) : t);
  }
  [qe]() {
    if (this[dt] && !this[Gi] && !this[ut] && !this[le]) {
      this[Gi] = true;
      let t = this[Dt];
      if (t && t.blockRemain) {
        let e = this[p] ? this[p].length : 0;
        this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${t.blockRemain} more bytes, only ${e} available)`, { entry: t }), this[p] && t.write(this[p]), t.end();
      }
      this[At](Qe);
    }
  }
  [$e](t) {
    if (this[le] && t)
      this[Yi](t);
    else if (!t && !this[p])
      this[qe]();
    else if (t) {
      if (this[le] = true, this[p]) {
        this[Yi](t);
        let e = this[p];
        this[p] = undefined, this[Xe](e);
      } else
        this[Xe](t);
      for (;this[p] && this[p]?.length >= 512 && !this[ut] && !this[je]; ) {
        let e = this[p];
        this[p] = undefined, this[Xe](e);
      }
      this[le] = false;
    }
    (!this[p] || this[dt]) && this[qe]();
  }
  [Xe](t) {
    let e = 0, i = t.length;
    for (;e + 512 <= i && !this[ut] && !this[je]; )
      switch (this[B]) {
        case "begin":
        case "header":
          this[Zs](t, e), e += 512;
          break;
        case "ignore":
        case "body":
          e += this[Zi](t, e);
          break;
        case "meta":
          e += this[Gs](t, e);
          break;
        default:
          throw new Error("invalid state: " + this[B]);
      }
    e < i && (this[p] = this[p] ? Buffer.concat([t.subarray(e), this[p]]) : t.subarray(e));
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, e = undefined, t = undefined), typeof e == "function" && (i = e, e = undefined), typeof t == "string" && (t = Buffer.from(t, e)), i && this.once("finish", i), this[ut] || (this[y] ? (t && this[y].write(t), this[y].end()) : (this[dt] = true, (this.brotli === undefined || this.zstd === undefined) && (t = t || Buffer.alloc(0)), t && this.write(t), this[qe]())), this;
  }
};
var mt = (s2) => {
  let t = s2.length - 1, e = -1;
  for (;t > -1 && s2.charAt(t) === "/"; )
    e = t, t--;
  return e === -1 ? s2 : s2.slice(0, e);
};
var Dn = (s2) => {
  let t = s2.onReadEntry;
  s2.onReadEntry = t ? (e) => {
    t(e), e.resume();
  } : (e) => e.resume();
};
var $i = (s2, t) => {
  let e = new Map(t.map((n) => [mt(n), true])), i = s2.filter, r = (n, o = "") => {
    let h = o || Nn(n).root || ".", a;
    if (n === h)
      a = false;
    else {
      let l = e.get(n);
      a = l !== undefined ? l : r(Ln(n), h);
    }
    return e.set(n, a), a;
  };
  s2.filter = i ? (n, o) => i(n, o) && r(mt(n)) : (n) => r(mt(n));
};
var An = (s2) => {
  let t = new st(s2), e = s2.file, i;
  try {
    i = Vt.openSync(e, "r");
    let r = Vt.fstatSync(i), n = s2.maxReadSize || 16 * 1024 * 1024;
    if (r.size < n) {
      let o = Buffer.allocUnsafe(r.size), h = Vt.readSync(i, o, 0, r.size, 0);
      t.end(h === o.byteLength ? o : o.subarray(0, h));
    } else {
      let o = 0, h = Buffer.allocUnsafe(n);
      for (;o < r.size; ) {
        let a = Vt.readSync(i, h, 0, n, o);
        if (a === 0)
          break;
        o += a, t.write(h.subarray(0, a));
      }
      t.end();
    }
  } finally {
    if (typeof i == "number")
      try {
        Vt.closeSync(i);
      } catch {}
  }
};
var In = (s2, t) => {
  let e = new st(s2), i = s2.maxReadSize || 16 * 1024 * 1024, r = s2.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("end", o), Vt.stat(r, (a, l) => {
      if (a)
        h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var Ct = K(An, In, (s2) => new st(s2), (s2) => new st(s2), (s2, t) => {
  t?.length && $i(s2, t), s2.noResume || Dn(s2);
});
var Xi = (s2, t, e) => (s2 &= 4095, e && (s2 = (s2 | 384) & -19), t && (s2 & 256 && (s2 |= 64), s2 & 32 && (s2 |= 8), s2 & 4 && (s2 |= 1)), s2);
var { isAbsolute: kn, parse: Ks } = Cn;
var ce = (s2) => {
  let t = "", e = Ks(s2);
  for (;kn(s2) || e.root; ) {
    let i = s2.charAt(0) === "/" && s2.slice(0, 4) !== "//?/" ? "/" : e.root;
    s2 = s2.slice(i.length), t += i, e = Ks(s2);
  }
  return [t, s2];
};
var ti = ["|", "<", ">", "?", ":"];
var qi = ti.map((s2) => String.fromCodePoint(61440 + Number(s2.codePointAt(0))));
var Fn = new Map(ti.map((s2, t) => [s2, qi[t]]));
var vn = new Map(qi.map((s2, t) => [s2, ti[t]]));
var Qi = (s2) => ti.reduce((t, e) => t.split(e).join(Fn.get(e)), s2);
var Vs = (s2) => qi.reduce((t, e) => t.split(e).join(vn.get(e)), s2);
var tr = (s2, t) => t ? (s2 = f(s2).replace(/^\.(\/|$)/, ""), mt(t) + "/" + s2) : f(s2);
var Mn = 16 * 1024 * 1024;
var qs = Symbol("process");
var Qs = Symbol("file");
var Js = Symbol("directory");
var ji = Symbol("symlink");
var js = Symbol("hardlink");
var fe = Symbol("header");
var ei = Symbol("read");
var ts = Symbol("lstat");
var ii = Symbol("onlstat");
var es = Symbol("onread");
var is = Symbol("onreadlink");
var ss = Symbol("openfile");
var rs = Symbol("onopenfile");
var pt = Symbol("close");
var si = Symbol("mode");
var ns = Symbol("awaitDrain");
var Ji = Symbol("ondrain");
var X = Symbol("prefix");
var de = class extends A {
  path;
  portable;
  myuid = process.getuid && process.getuid() || 0;
  myuser = process.env.USER || "";
  maxReadSize;
  linkCache;
  statCache;
  preservePaths;
  cwd;
  strict;
  mtime;
  noPax;
  noMtime;
  prefix;
  fd;
  blockLen = 0;
  blockRemain = 0;
  buf;
  pos = 0;
  remain = 0;
  length = 0;
  offset = 0;
  win32;
  absolute;
  header;
  type;
  linkpath;
  stat;
  onWriteEntry;
  #t = false;
  constructor(t, e = {}) {
    let i = re(e);
    super(), this.path = f(t), this.portable = !!i.portable, this.maxReadSize = i.maxReadSize || Mn, this.linkCache = i.linkCache || new Map, this.statCache = i.statCache || new Map, this.preservePaths = !!i.preservePaths, this.cwd = f(i.cwd || process.cwd()), this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.mtime = i.mtime, this.prefix = i.prefix ? f(i.prefix) : undefined, this.onWriteEntry = i.onWriteEntry, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let r = false;
    if (!this.preservePaths) {
      let [o, h] = ce(this.path);
      o && typeof h == "string" && (this.path = h, r = o);
    }
    this.win32 = !!i.win32 || process.platform === "win32", this.win32 && (this.path = Vs(this.path.replaceAll(/\\/g, "/")), t = t.replaceAll(/\\/g, "/")), this.absolute = f(i.absolute || Xs.resolve(this.cwd, t)), this.path === "" && (this.path = "./"), r && this.warn("TAR_ENTRY_INFO", `stripping ${r} from absolute path`, { entry: this, path: r + this.path });
    let n = this.statCache.get(this.absolute);
    n ? this[ii](n) : this[ts]();
  }
  warn(t, e, i = {}) {
    return Nt(this, t, e, i);
  }
  emit(t, ...e) {
    return t === "error" && (this.#t = true), super.emit(t, ...e);
  }
  [ts]() {
    $.lstat(this.absolute, (t, e) => {
      if (t)
        return this.emit("error", t);
      this[ii](e);
    });
  }
  [ii](t) {
    this.statCache.set(this.absolute, t), this.stat = t, t.isFile() || (t.size = 0), this.type = Bn(t), this.emit("stat", t), this[qs]();
  }
  [qs]() {
    switch (this.type) {
      case "File":
        return this[Qs]();
      case "Directory":
        return this[Js]();
      case "SymbolicLink":
        return this[ji]();
      default:
        return this.end();
    }
  }
  [si](t) {
    return Xi(t, this.type === "Directory", this.portable);
  }
  [X](t) {
    return tr(t, this.prefix);
  }
  [fe]() {
    if (!this.stat)
      throw new Error("cannot write header before stat");
    this.type === "Directory" && this.portable && (this.noMtime = true), this.onWriteEntry?.(this), this.header = new k({ path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== undefined ? this[X](this.linkpath) : this.linkpath, mode: this[si](this.stat.mode), uid: this.portable ? undefined : this.stat.uid, gid: this.portable ? undefined : this.stat.gid, size: this.stat.size, mtime: this.noMtime ? undefined : this.mtime || this.stat.mtime, type: this.type === "Unsupported" ? undefined : this.type, uname: this.portable ? undefined : this.stat.uid === this.myuid ? this.myuser : "", atime: this.portable ? undefined : this.stat.atime, ctime: this.portable ? undefined : this.stat.ctime }), this.header.encode() && !this.noPax && super.write(new ct({ atime: this.portable ? undefined : this.header.atime, ctime: this.portable ? undefined : this.header.ctime, gid: this.portable ? undefined : this.header.gid, mtime: this.noMtime ? undefined : this.mtime || this.header.mtime, path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== undefined ? this[X](this.linkpath) : this.linkpath, size: this.header.size, uid: this.portable ? undefined : this.header.uid, uname: this.portable ? undefined : this.header.uname, dev: this.portable ? undefined : this.stat.dev, ino: this.portable ? undefined : this.stat.ino, nlink: this.portable ? undefined : this.stat.nlink }).encode());
    let t = this.header?.block;
    if (!t)
      throw new Error("failed to encode header");
    super.write(t);
  }
  [Js]() {
    if (!this.stat)
      throw new Error("cannot create directory entry without stat");
    this.path.slice(-1) !== "/" && (this.path += "/"), this.stat.size = 0, this[fe](), this.end();
  }
  [ji]() {
    $.readlink(this.absolute, (t, e) => {
      if (t)
        return this.emit("error", t);
      this[is](e);
    });
  }
  [is](t) {
    this.linkpath = f(t), this[fe](), this.end();
  }
  [js](t) {
    if (!this.stat)
      throw new Error("cannot create link entry without stat");
    this.type = "Link", this.linkpath = f(Xs.relative(this.cwd, t)), this.stat.size = 0, this[fe](), this.end();
  }
  [Qs]() {
    if (!this.stat)
      throw new Error("cannot create file entry without stat");
    if (this.stat.nlink > 1) {
      let t = `${this.stat.dev}:${this.stat.ino}`, e = this.linkCache.get(t);
      if (e?.indexOf(this.cwd) === 0)
        return this[js](e);
      this.linkCache.set(t, this.absolute);
    }
    if (this[fe](), this.stat.size === 0)
      return this.end();
    this[ss]();
  }
  [ss]() {
    $.open(this.absolute, "r", (t, e) => {
      if (t)
        return this.emit("error", t);
      this[rs](e);
    });
  }
  [rs](t) {
    if (this.fd = t, this.#t)
      return this[pt]();
    if (!this.stat)
      throw new Error("should stat before calling onopenfile");
    this.blockLen = 512 * Math.ceil(this.stat.size / 512), this.blockRemain = this.blockLen;
    let e = Math.min(this.blockLen, this.maxReadSize);
    this.buf = Buffer.allocUnsafe(e), this.offset = 0, this.pos = 0, this.remain = this.stat.size, this.length = this.buf.length, this[ei]();
  }
  [ei]() {
    let { fd: t, buf: e, offset: i, length: r, pos: n } = this;
    if (t === undefined || e === undefined)
      throw new Error("cannot read file without first opening");
    $.read(t, e, i, r, n, (o, h) => {
      if (o)
        return this[pt](() => this.emit("error", o));
      this[es](h);
    });
  }
  [pt](t = () => {}) {
    this.fd !== undefined && $.close(this.fd, t);
  }
  [es](t) {
    if (t <= 0 && this.remain > 0) {
      let r = Object.assign(new Error("encountered unexpected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (t > this.remain) {
      let r = Object.assign(new Error("did not encounter expected EOF"), { path: this.absolute, syscall: "read", code: "EOF" });
      return this[pt](() => this.emit("error", r));
    }
    if (!this.buf)
      throw new Error("should have created buffer prior to reading");
    if (t === this.remain)
      for (let r = t;r < this.length && t < this.blockRemain; r++)
        this.buf[r + this.offset] = 0, t++, this.remain++;
    let e = this.offset === 0 && t === this.buf.length ? this.buf : this.buf.subarray(this.offset, this.offset + t);
    this.write(e) ? this[Ji]() : this[ns](() => this[Ji]());
  }
  [ns](t) {
    this.once("drain", t);
  }
  write(t, e, i) {
    if (typeof e == "function" && (i = e, e = undefined), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8")), this.blockRemain < t.length) {
      let r = Object.assign(new Error("writing more data than expected"), { path: this.absolute });
      return this.emit("error", r);
    }
    return this.remain -= t.length, this.blockRemain -= t.length, this.pos += t.length, this.offset += t.length, super.write(t, null, i);
  }
  [Ji]() {
    if (!this.remain)
      return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), this[pt]((t) => t ? this.emit("error", t) : this.end());
    if (!this.buf)
      throw new Error("buffer lost somehow in ONDRAIN");
    this.offset >= this.length && (this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length)), this.offset = 0), this.length = this.buf.length - this.offset, this[ei]();
  }
};
var ri = class extends de {
  sync = true;
  [ts]() {
    this[ii]($.lstatSync(this.absolute));
  }
  [ji]() {
    this[is]($.readlinkSync(this.absolute));
  }
  [ss]() {
    this[rs]($.openSync(this.absolute, "r"));
  }
  [ei]() {
    let t = true;
    try {
      let { fd: e, buf: i, offset: r, length: n, pos: o } = this;
      if (e === undefined || i === undefined)
        throw new Error("fd and buf must be set in READ method");
      let h = $.readSync(e, i, r, n, o);
      this[es](h), t = false;
    } finally {
      if (t)
        try {
          this[pt](() => {});
        } catch {}
    }
  }
  [ns](t) {
    t();
  }
  [pt](t = () => {}) {
    this.fd !== undefined && $.closeSync(this.fd), t();
  }
};
var ni = class extends A {
  blockLen = 0;
  blockRemain = 0;
  buf = 0;
  pos = 0;
  remain = 0;
  length = 0;
  preservePaths;
  portable;
  strict;
  noPax;
  noMtime;
  readEntry;
  type;
  prefix;
  path;
  mode;
  uid;
  gid;
  uname;
  gname;
  header;
  mtime;
  atime;
  ctime;
  linkpath;
  size;
  onWriteEntry;
  warn(t, e, i = {}) {
    return Nt(this, t, e, i);
  }
  constructor(t, e = {}) {
    let i = re(e);
    super(), this.preservePaths = !!i.preservePaths, this.portable = !!i.portable, this.strict = !!i.strict, this.noPax = !!i.noPax, this.noMtime = !!i.noMtime, this.onWriteEntry = i.onWriteEntry, this.readEntry = t;
    let { type: r } = t;
    if (r === "Unsupported")
      throw new Error("writing entry that should be ignored");
    this.type = r, this.type === "Directory" && this.portable && (this.noMtime = true), this.prefix = i.prefix, this.path = f(t.path), this.mode = t.mode !== undefined ? this[si](t.mode) : undefined, this.uid = this.portable ? undefined : t.uid, this.gid = this.portable ? undefined : t.gid, this.uname = this.portable ? undefined : t.uname, this.gname = this.portable ? undefined : t.gname, this.size = t.size, this.mtime = this.noMtime ? undefined : i.mtime || t.mtime, this.atime = this.portable ? undefined : t.atime, this.ctime = this.portable ? undefined : t.ctime, this.linkpath = t.linkpath !== undefined ? f(t.linkpath) : undefined, typeof i.onwarn == "function" && this.on("warn", i.onwarn);
    let n = false;
    if (!this.preservePaths) {
      let [h, a] = ce(this.path);
      h && typeof a == "string" && (this.path = a, n = h);
    }
    this.remain = t.size, this.blockRemain = t.startBlockSize, this.onWriteEntry?.(this), this.header = new k({ path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== undefined ? this[X](this.linkpath) : this.linkpath, mode: this.mode, uid: this.portable ? undefined : this.uid, gid: this.portable ? undefined : this.gid, size: this.size, mtime: this.noMtime ? undefined : this.mtime, type: this.type, uname: this.portable ? undefined : this.uname, atime: this.portable ? undefined : this.atime, ctime: this.portable ? undefined : this.ctime }), n && this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute path`, { entry: this, path: n + this.path }), this.header.encode() && !this.noPax && super.write(new ct({ atime: this.portable ? undefined : this.atime, ctime: this.portable ? undefined : this.ctime, gid: this.portable ? undefined : this.gid, mtime: this.noMtime ? undefined : this.mtime, path: this[X](this.path), linkpath: this.type === "Link" && this.linkpath !== undefined ? this[X](this.linkpath) : this.linkpath, size: this.size, uid: this.portable ? undefined : this.uid, uname: this.portable ? undefined : this.uname, dev: this.portable ? undefined : this.readEntry.dev, ino: this.portable ? undefined : this.readEntry.ino, nlink: this.portable ? undefined : this.readEntry.nlink }).encode());
    let o = this.header?.block;
    if (!o)
      throw new Error("failed to encode header");
    super.write(o), t.pipe(this);
  }
  [X](t) {
    return tr(t, this.prefix);
  }
  [si](t) {
    return Xi(t, this.type === "Directory", this.portable);
  }
  write(t, e, i) {
    typeof e == "function" && (i = e, e = undefined), typeof t == "string" && (t = Buffer.from(t, typeof e == "string" ? e : "utf8"));
    let r = t.length;
    if (r > this.blockRemain)
      throw new Error("writing more to entry than is appropriate");
    return this.blockRemain -= r, super.write(t, i);
  }
  end(t, e, i) {
    return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), typeof t == "function" && (i = t, e = undefined, t = undefined), typeof e == "function" && (i = e, e = undefined), typeof t == "string" && (t = Buffer.from(t, e ?? "utf8")), i && this.once("finish", i), t ? super.end(t, i) : super.end(i), this;
  }
};
var Bn = (s2) => s2.isFile() ? "File" : s2.isDirectory() ? "Directory" : s2.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
var oi = class s2 {
  tail;
  head;
  length = 0;
  static create(t = []) {
    return new s2(t);
  }
  constructor(t = []) {
    for (let e of t)
      this.push(e);
  }
  *[Symbol.iterator]() {
    for (let t = this.head;t; t = t.next)
      yield t.value;
  }
  removeNode(t) {
    if (t.list !== this)
      throw new Error("removing node which does not belong to this list");
    let { next: e, prev: i } = t;
    return e && (e.prev = i), i && (i.next = e), t === this.head && (this.head = e), t === this.tail && (this.tail = i), this.length--, t.next = undefined, t.prev = undefined, t.list = undefined, e;
  }
  unshiftNode(t) {
    if (t === this.head)
      return;
    t.list && t.list.removeNode(t);
    let e = this.head;
    t.list = this, t.next = e, e && (e.prev = t), this.head = t, this.tail || (this.tail = t), this.length++;
  }
  pushNode(t) {
    if (t === this.tail)
      return;
    t.list && t.list.removeNode(t);
    let e = this.tail;
    t.list = this, t.prev = e, e && (e.next = t), this.tail = t, this.head || (this.head = t), this.length++;
  }
  push(...t) {
    for (let e = 0, i = t.length;e < i; e++)
      zn(this, t[e]);
    return this.length;
  }
  unshift(...t) {
    for (var e = 0, i = t.length;e < i; e++)
      Un(this, t[e]);
    return this.length;
  }
  pop() {
    if (!this.tail)
      return;
    let t = this.tail.value, e = this.tail;
    return this.tail = this.tail.prev, this.tail ? this.tail.next = undefined : this.head = undefined, e.list = undefined, this.length--, t;
  }
  shift() {
    if (!this.head)
      return;
    let t = this.head.value, e = this.head;
    return this.head = this.head.next, this.head ? this.head.prev = undefined : this.tail = undefined, e.list = undefined, this.length--, t;
  }
  forEach(t, e) {
    e = e || this;
    for (let i = this.head, r = 0;i; r++)
      t.call(e, i.value, r, this), i = i.next;
  }
  forEachReverse(t, e) {
    e = e || this;
    for (let i = this.tail, r = this.length - 1;i; r--)
      t.call(e, i.value, r, this), i = i.prev;
  }
  get(t) {
    let e = 0, i = this.head;
    for (;i && e < t; e++)
      i = i.next;
    if (e === t && i)
      return i.value;
  }
  getReverse(t) {
    let e = 0, i = this.tail;
    for (;i && e < t; e++)
      i = i.prev;
    if (e === t && i)
      return i.value;
  }
  map(t, e) {
    e = e || this;
    let i = new s2;
    for (let r = this.head;r; )
      i.push(t.call(e, r.value, this)), r = r.next;
    return i;
  }
  mapReverse(t, e) {
    e = e || this;
    var i = new s2;
    for (let r = this.tail;r; )
      i.push(t.call(e, r.value, this)), r = r.prev;
    return i;
  }
  reduce(t, e) {
    let i, r = this.head;
    if (arguments.length > 1)
      i = e;
    else if (this.head)
      r = this.head.next, i = this.head.value;
    else
      throw new TypeError("Reduce of empty list with no initial value");
    for (var n = 0;r; n++)
      i = t(i, r.value, n), r = r.next;
    return i;
  }
  reduceReverse(t, e) {
    let i, r = this.tail;
    if (arguments.length > 1)
      i = e;
    else if (this.tail)
      r = this.tail.prev, i = this.tail.value;
    else
      throw new TypeError("Reduce of empty list with no initial value");
    for (let n = this.length - 1;r; n--)
      i = t(i, r.value, n), r = r.prev;
    return i;
  }
  toArray() {
    let t = new Array(this.length);
    for (let e = 0, i = this.head;i; e++)
      t[e] = i.value, i = i.next;
    return t;
  }
  toArrayReverse() {
    let t = new Array(this.length);
    for (let e = 0, i = this.tail;i; e++)
      t[e] = i.value, i = i.prev;
    return t;
  }
  slice(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2;
    if (e < t || e < 0)
      return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.head, n = 0;
    for (n = 0;r && n < t; n++)
      r = r.next;
    for (;r && n < e; n++, r = r.next)
      i.push(r.value);
    return i;
  }
  sliceReverse(t = 0, e = this.length) {
    e < 0 && (e += this.length), t < 0 && (t += this.length);
    let i = new s2;
    if (e < t || e < 0)
      return i;
    t < 0 && (t = 0), e > this.length && (e = this.length);
    let r = this.length, n = this.tail;
    for (;n && r > e; r--)
      n = n.prev;
    for (;n && r > t; r--, n = n.prev)
      i.push(n.value);
    return i;
  }
  splice(t, e = 0, ...i) {
    t > this.length && (t = this.length - 1), t < 0 && (t = this.length + t);
    let r = this.head;
    for (let o = 0;r && o < t; o++)
      r = r.next;
    let n = [];
    for (let o = 0;r && o < e; o++)
      n.push(r.value), r = this.removeNode(r);
    r ? r !== this.tail && (r = r.prev) : r = this.tail;
    for (let o of i)
      r = Pn(this, r, o);
    return n;
  }
  reverse() {
    let t = this.head, e = this.tail;
    for (let i = t;i; i = i.prev) {
      let r = i.prev;
      i.prev = i.next, i.next = r;
    }
    return this.head = e, this.tail = t, this;
  }
};
function Pn(s3, t, e) {
  let i = t, r = t ? t.next : s3.head, n = new ue(e, i, r, s3);
  return n.next === undefined && (s3.tail = n), n.prev === undefined && (s3.head = n), s3.length++, n;
}
function zn(s3, t) {
  s3.tail = new ue(t, s3.tail, undefined, s3), s3.head || (s3.head = s3.tail), s3.length++;
}
function Un(s3, t) {
  s3.head = new ue(t, undefined, s3.head, s3), s3.tail || (s3.tail = s3.head), s3.length++;
}
var ue = class {
  list;
  next;
  prev;
  value;
  constructor(t, e, i, r) {
    this.list = r, this.value = t, e ? (e.next = this, this.prev = e) : this.prev = undefined, i ? (i.prev = this, this.next = i) : this.next = undefined;
  }
};
var mi = class {
  path;
  absolute;
  entry;
  stat;
  readdir;
  pending = false;
  pendingLink = false;
  ignore = false;
  piped = false;
  constructor(t, e) {
    this.path = t || "./", this.absolute = e;
  }
};
var er = Buffer.alloc(1024);
var ai = Symbol("onStat");
var me = Symbol("ended");
var W = Symbol("queue");
var pe = Symbol("queue");
var Et = Symbol("current");
var kt = Symbol("process");
var Ee = Symbol("processing");
var hi = Symbol("processJob");
var G = Symbol("jobs");
var os = Symbol("jobDone");
var li = Symbol("addFSEntry");
var ir = Symbol("addTarEntry");
var ls = Symbol("stat");
var cs = Symbol("readdir");
var ci = Symbol("onreaddir");
var fi = Symbol("pipe");
var sr = Symbol("entry");
var hs = Symbol("entryOpt");
var di = Symbol("writeEntryClass");
var nr = Symbol("write");
var as = Symbol("ondrain");
var wt = class extends A {
  sync = false;
  opt;
  cwd;
  maxReadSize;
  preservePaths;
  strict;
  noPax;
  prefix;
  linkCache;
  statCache;
  file;
  portable;
  zip;
  readdirCache;
  noDirRecurse;
  follow;
  noMtime;
  mtime;
  filter;
  jobs;
  [di];
  onWriteEntry;
  [W];
  [pe] = new Map;
  [G] = 0;
  [Ee] = false;
  [me] = false;
  constructor(t = {}) {
    if (super(), this.opt = t, this.file = t.file || "", this.cwd = t.cwd || process.cwd(), this.maxReadSize = t.maxReadSize, this.preservePaths = !!t.preservePaths, this.strict = !!t.strict, this.noPax = !!t.noPax, this.prefix = f(t.prefix || ""), this.linkCache = t.linkCache || new Map, this.statCache = t.statCache || new Map, this.readdirCache = t.readdirCache || new Map, this.onWriteEntry = t.onWriteEntry, this[di] = de, typeof t.onwarn == "function" && this.on("warn", t.onwarn), this.portable = !!t.portable, t.gzip || t.brotli || t.zstd) {
      if ((t.gzip ? 1 : 0) + (t.brotli ? 1 : 0) + (t.zstd ? 1 : 0) > 1)
        throw new TypeError("gzip, brotli, zstd are mutually exclusive");
      if (t.gzip && (typeof t.gzip != "object" && (t.gzip = {}), this.portable && (t.gzip.portable = true), this.zip = new ze(t.gzip)), t.brotli && (typeof t.brotli != "object" && (t.brotli = {}), this.zip = new We(t.brotli)), t.zstd && (typeof t.zstd != "object" && (t.zstd = {}), this.zip = new Ye(t.zstd)), !this.zip)
        throw new Error("impossible");
      let e = this.zip;
      e.on("data", (i) => super.write(i)), e.on("end", () => super.end()), e.on("drain", () => this[as]()), this.on("resume", () => e.resume());
    } else
      this.on("drain", this[as]);
    this.noDirRecurse = !!t.noDirRecurse, this.follow = !!t.follow, this.noMtime = !!t.noMtime, t.mtime && (this.mtime = t.mtime), this.filter = typeof t.filter == "function" ? t.filter : () => true, this[W] = new oi, this[G] = 0, this.jobs = Number(t.jobs) || 4, this[Ee] = false, this[me] = false;
  }
  [nr](t) {
    return super.write(t);
  }
  add(t) {
    return this.write(t), this;
  }
  end(t, e, i) {
    return typeof t == "function" && (i = t, t = undefined), typeof e == "function" && (i = e, e = undefined), t && this.add(t), this[me] = true, this[kt](), i && i(), this;
  }
  write(t) {
    if (this[me])
      throw new Error("write after end");
    return t instanceof Yt ? this[ir](t) : this[li](t), this.flowing;
  }
  [ir](t) {
    let e = f(rr.resolve(this.cwd, t.path));
    if (!this.filter(t.path, t))
      t.resume();
    else {
      let i = new mi(t.path, e);
      i.entry = new ni(t, this[hs](i)), i.entry.on("end", () => this[os](i)), this[G] += 1, this[W].push(i);
    }
    this[kt]();
  }
  [li](t) {
    let e = f(rr.resolve(this.cwd, t));
    this[W].push(new mi(t, e)), this[kt]();
  }
  [ls](t) {
    t.pending = true, this[G] += 1;
    let e = this.follow ? "stat" : "lstat";
    ui[e](t.absolute, (i, r) => {
      t.pending = false, this[G] -= 1, i ? this.emit("error", i) : this[ai](t, r);
    });
  }
  [ai](t, e) {
    if (this.statCache.set(t.absolute, e), t.stat = e, !this.filter(t.path, e))
      t.ignore = true;
    else if (e.isFile() && e.nlink > 1 && !this.linkCache.get(`${e.dev}:${e.ino}`) && !this.sync)
      if (t === this[Et])
        this[hi](t);
      else {
        let i = `${e.dev}:${e.ino}`, r = this[pe].get(i);
        r ? r.push(t) : this[pe].set(i, [t]), t.pendingLink = true, t.pending = true;
      }
    this[kt]();
  }
  [cs](t) {
    t.pending = true, this[G] += 1, ui.readdir(t.absolute, (e, i) => {
      if (t.pending = false, this[G] -= 1, e)
        return this.emit("error", e);
      this[ci](t, i);
    });
  }
  [ci](t, e) {
    this.readdirCache.set(t.absolute, e), t.readdir = e, this[kt]();
  }
  [kt]() {
    if (!this[Ee]) {
      this[Ee] = true;
      for (let t = this[W].head;t && this[G] < this.jobs; t = t.next)
        if (this[hi](t.value), t.value.ignore) {
          let e = t.next;
          this[W].removeNode(t), t.next = e;
        }
      this[Ee] = false, this[me] && this[W].length === 0 && this[G] === 0 && (this.zip ? this.zip.end(er) : (super.write(er), super.end()));
    }
  }
  get [Et]() {
    return this[W] && this[W].head && this[W].head.value;
  }
  [os](t) {
    this[W].shift(), this[G] -= 1;
    let { stat: e } = t;
    if (e && e.isFile() && e.nlink > 1) {
      let i = `${e.dev}:${e.ino}`, r = this[pe].get(i);
      if (r) {
        this[pe].delete(i);
        for (let n of r)
          n.pending = false, this[hi](n);
      }
    }
    this[kt]();
  }
  [hi](t) {
    if (t.pending && t.pendingLink && t === this[Et] && (t.pending = false, t.pendingLink = false), !t.pending) {
      if (t.entry) {
        t === this[Et] && !t.piped && this[fi](t);
        return;
      }
      if (!t.stat) {
        let e = this.statCache.get(t.absolute);
        e ? this[ai](t, e) : this[ls](t);
      }
      if (t.stat && !t.ignore) {
        if (!this.noDirRecurse && t.stat.isDirectory() && !t.readdir) {
          let e = this.readdirCache.get(t.absolute);
          if (e ? this[ci](t, e) : this[cs](t), !t.readdir)
            return;
        }
        if (t.entry = this[sr](t), !t.entry) {
          t.ignore = true;
          return;
        }
        t === this[Et] && !t.piped && this[fi](t);
      }
    }
  }
  [hs](t) {
    return { onwarn: (e, i, r) => this.warn(e, i, r), noPax: this.noPax, cwd: this.cwd, absolute: t.absolute, preservePaths: this.preservePaths, maxReadSize: this.maxReadSize, strict: this.strict, portable: this.portable, linkCache: this.linkCache, statCache: this.statCache, noMtime: this.noMtime, mtime: this.mtime, prefix: this.prefix, onWriteEntry: this.onWriteEntry };
  }
  [sr](t) {
    this[G] += 1;
    try {
      return new this[di](t.path, this[hs](t)).on("end", () => this[os](t)).on("error", (i) => this.emit("error", i));
    } catch (e) {
      this.emit("error", e);
    }
  }
  [as]() {
    this[Et] && this[Et].entry && this[Et].entry.resume();
  }
  [fi](t) {
    t.piped = true, t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[li](o + r);
    });
    let e = t.entry, i = this.zip;
    if (!e)
      throw new Error("cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r) || e.pause();
    }) : e.on("data", (r) => {
      super.write(r) || e.pause();
    });
  }
  pause() {
    return this.zip && this.zip.pause(), super.pause();
  }
  warn(t, e, i = {}) {
    Nt(this, t, e, i);
  }
};
var Ft = class extends wt {
  sync = true;
  constructor(t) {
    super(t), this[di] = ri;
  }
  pause() {}
  resume() {}
  [ls](t) {
    let e = this.follow ? "statSync" : "lstatSync";
    this[ai](t, ui[e](t.absolute));
  }
  [cs](t) {
    this[ci](t, ui.readdirSync(t.absolute));
  }
  [fi](t) {
    let e = t.entry, i = this.zip;
    if (t.readdir && t.readdir.forEach((r) => {
      let n = t.path, o = n === "./" ? "" : n.replace(/\/*$/, "/");
      this[li](o + r);
    }), !e)
      throw new Error("Cannot pipe without source");
    i ? e.on("data", (r) => {
      i.write(r);
    }) : e.on("data", (r) => {
      super[nr](r);
    });
  }
};
var Hn = (s3, t) => {
  let e = new Ft(s3), i = new Wt(s3.file, { mode: s3.mode || 438 });
  e.pipe(i), hr(e, t);
};
var Wn = (s3, t) => {
  let e = new wt(s3), i = new tt(s3.file, { mode: s3.mode || 438 });
  e.pipe(i);
  let r = new Promise((n, o) => {
    i.on("error", o), i.on("close", n), e.on("error", o);
  });
  return ar(e, t).catch((n) => e.emit("error", n)), r;
};
var hr = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? Ct({ file: or.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var ar = async (s3, t) => {
  for (let e of t)
    e.charAt(0) === "@" ? await Ct({ file: or.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => {
      s3.add(i);
    } }) : s3.add(e);
  s3.end();
};
var Gn = (s3, t) => {
  let e = new Ft(s3);
  return hr(e, t), e;
};
var Zn = (s3, t) => {
  let e = new wt(s3);
  return ar(e, t).catch((i) => e.emit("error", i)), e;
};
var Yn = K(Hn, Wn, Gn, Zn, (s3, t) => {
  if (!t?.length)
    throw new TypeError("no paths specified to add to archive");
});
var Kn = process.env.__FAKE_PLATFORM__ || process.platform;
var dr = Kn === "win32";
var { O_CREAT: ur, O_NOFOLLOW: lr, O_TRUNC: mr, O_WRONLY: pr } = fr.constants;
var Er = Number(process.env.__FAKE_FS_O_FILENAME__) || fr.constants.UV_FS_O_FILEMAP || 0;
var Vn = dr && !!Er;
var $n = 512 * 1024;
var Xn = Er | mr | ur | pr;
var cr = !dr && typeof lr == "number" ? lr | mr | ur | pr : null;
var fs = cr !== null ? () => cr : Vn ? (s3) => s3 < $n ? Xn : "w" : () => "w";
var ds = (s3, t, e) => {
  try {
    return Ei.lchownSync(s3, t, e);
  } catch (i) {
    if (i?.code !== "ENOENT")
      throw i;
  }
};
var pi = (s3, t, e, i) => {
  Ei.lchown(s3, t, e, (r) => {
    i(r && r?.code !== "ENOENT" ? r : null);
  });
};
var qn = (s3, t, e, i, r) => {
  if (t.isDirectory())
    us(we.resolve(s3, t.name), e, i, (n) => {
      if (n)
        return r(n);
      let o = we.resolve(s3, t.name);
      pi(o, e, i, r);
    });
  else {
    let n = we.resolve(s3, t.name);
    pi(n, e, i, r);
  }
};
var us = (s3, t, e, i) => {
  Ei.readdir(s3, { withFileTypes: true }, (r, n) => {
    if (r) {
      if (r.code === "ENOENT")
        return i();
      if (r.code !== "ENOTDIR" && r.code !== "ENOTSUP")
        return i(r);
    }
    if (r || !n.length)
      return pi(s3, t, e, i);
    let o = n.length, h = null, a = (l) => {
      if (!h) {
        if (l)
          return i(h = l);
        if (--o === 0)
          return pi(s3, t, e, i);
      }
    };
    for (let l of n)
      qn(s3, l, t, e, a);
  });
};
var Qn = (s3, t, e, i) => {
  t.isDirectory() && ms(we.resolve(s3, t.name), e, i), ds(we.resolve(s3, t.name), e, i);
};
var ms = (s3, t, e) => {
  let i;
  try {
    i = Ei.readdirSync(s3, { withFileTypes: true });
  } catch (r) {
    let n = r;
    if (n?.code === "ENOENT")
      return;
    if (n?.code === "ENOTDIR" || n?.code === "ENOTSUP")
      return ds(s3, t, e);
    throw n;
  }
  for (let r of i)
    Qn(s3, r, t, e);
  return ds(s3, t, e);
};
var Se = class extends Error {
  path;
  code;
  syscall = "chdir";
  constructor(t, e) {
    super(`${e}: Cannot cd into '${t}'`), this.path = t, this.code = e;
  }
  get name() {
    return "CwdError";
  }
};
var St = class extends Error {
  path;
  symlink;
  syscall = "symlink";
  code = "TAR_SYMLINK_ERROR";
  constructor(t, e) {
    super("TAR_SYMLINK_ERROR: Cannot extract through symbolic link"), this.symlink = t, this.path = e;
  }
  get name() {
    return "SymlinkError";
  }
};
var jn = (s3, t) => {
  F.stat(s3, (e, i) => {
    (e || !i.isDirectory()) && (e = new Se(s3, e?.code || "ENOTDIR")), t(e);
  });
};
var wr = (s3, t, e) => {
  s3 = f(s3);
  let i = t.umask ?? 18, r = t.mode | 448, n = (r & i) !== 0, o = t.uid, h = t.gid, a = typeof o == "number" && typeof h == "number" && (o !== t.processUid || h !== t.processGid), l = t.preserve, c = t.unlink, d = f(t.cwd), S = (E, x) => {
    E ? e(E) : x && a ? us(x, o, h, (Le) => S(Le)) : n ? F.chmod(s3, r, e) : e();
  };
  if (s3 === d)
    return jn(s3, S);
  if (l)
    return Jn.mkdir(s3, { mode: r, recursive: true }).then((E) => S(null, E ?? undefined), S);
  let N = f(wi.relative(d, s3)).split("/");
  ps(d, N, r, c, d, undefined, S);
};
var ps = (s3, t, e, i, r, n, o) => {
  if (t.length === 0)
    return o(null, n);
  let h = t.shift(), a = f(wi.resolve(s3 + "/" + h));
  F.mkdir(a, e, Sr(a, t, e, i, r, n, o));
};
var Sr = (s3, t, e, i, r, n, o) => (h) => {
  h ? F.lstat(s3, (a, l) => {
    if (a)
      a.path = a.path && f(a.path), o(a);
    else if (l.isDirectory())
      ps(s3, t, e, i, r, n, o);
    else if (i)
      F.unlink(s3, (c) => {
        if (c)
          return o(c);
        F.mkdir(s3, e, Sr(s3, t, e, i, r, n, o));
      });
    else {
      if (l.isSymbolicLink())
        return o(new St(s3, s3 + "/" + t.join("/")));
      o(h);
    }
  }) : (n = n || s3, ps(s3, t, e, i, r, n, o));
};
var to = (s3) => {
  let t = false, e;
  try {
    t = F.statSync(s3).isDirectory();
  } catch (i) {
    e = i?.code;
  } finally {
    if (!t)
      throw new Se(s3, e ?? "ENOTDIR");
  }
};
var yr = (s3, t) => {
  s3 = f(s3);
  let e = t.umask ?? 18, i = t.mode | 448, r = (i & e) !== 0, n = t.uid, o = t.gid, h = typeof n == "number" && typeof o == "number" && (n !== t.processUid || o !== t.processGid), a = t.preserve, l = t.unlink, c = f(t.cwd), d = (E) => {
    E && h && ms(E, n, o), r && F.chmodSync(s3, i);
  };
  if (s3 === c)
    return to(c), d();
  if (a)
    return d(F.mkdirSync(s3, { mode: i, recursive: true }) ?? undefined);
  let T = f(wi.relative(c, s3)).split("/"), N;
  for (let E = T.shift(), x = c;E && (x += "/" + E); E = T.shift()) {
    x = f(wi.resolve(x));
    try {
      F.mkdirSync(x, i), N = N || x;
    } catch {
      let Le = F.lstatSync(x);
      if (Le.isDirectory())
        continue;
      if (l) {
        F.unlinkSync(x), F.mkdirSync(x, i), N = N || x;
        continue;
      } else if (Le.isSymbolicLink())
        return new St(x, x + "/" + T.join("/"));
    }
  }
  return d(N);
};
var Es = Object.create(null);
var Rr = 1e4;
var $t = new Set;
var gr = (s3) => {
  $t.has(s3) ? $t.delete(s3) : Es[s3] = s3.normalize("NFD").toLocaleLowerCase("en").toLocaleUpperCase("en"), $t.add(s3);
  let t = Es[s3], e = $t.size - Rr;
  if (e > Rr / 10) {
    for (let i of $t)
      if ($t.delete(i), delete Es[i], --e <= 0)
        break;
  }
  return t;
};
var eo = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var io = eo === "win32";
var so = (s3) => s3.split("/").slice(0, -1).reduce((e, i) => {
  let r = e.at(-1);
  return r !== undefined && (i = br(r, i)), e.push(i || "/"), e;
}, []);
var Si = class {
  #t = new Map;
  #i = new Map;
  #s = new Set;
  reserve(t, e) {
    t = io ? ["win32 parallelization disabled"] : t.map((r) => mt(br(gr(r))));
    let i = new Set(t.map((r) => so(r)).reduce((r, n) => r.concat(n)));
    this.#i.set(e, { dirs: i, paths: t });
    for (let r of t) {
      let n = this.#t.get(r);
      n ? n.push(e) : this.#t.set(r, [e]);
    }
    for (let r of i) {
      let n = this.#t.get(r);
      if (!n)
        this.#t.set(r, [new Set([e])]);
      else {
        let o = n.at(-1);
        o instanceof Set ? o.add(e) : n.push(new Set([e]));
      }
    }
    return this.#r(e);
  }
  #n(t) {
    let e = this.#i.get(t);
    if (!e)
      throw new Error("function does not have any path reservations");
    return { paths: e.paths.map((i) => this.#t.get(i)), dirs: [...e.dirs].map((i) => this.#t.get(i)) };
  }
  check(t) {
    let { paths: e, dirs: i } = this.#n(t);
    return e.every((r) => r && r[0] === t) && i.every((r) => r && r[0] instanceof Set && r[0].has(t));
  }
  #r(t) {
    return this.#s.has(t) || !this.check(t) ? false : (this.#s.add(t), t(() => this.#e(t)), true);
  }
  #e(t) {
    if (!this.#s.has(t))
      return false;
    let e = this.#i.get(t);
    if (!e)
      throw new Error("invalid reservation");
    let { paths: i, dirs: r } = e, n = new Set;
    for (let o of i) {
      let h = this.#t.get(o);
      if (!h || h?.[0] !== t)
        continue;
      let a = h[1];
      if (!a) {
        this.#t.delete(o);
        continue;
      }
      if (h.shift(), typeof a == "function")
        n.add(a);
      else
        for (let l of a)
          n.add(l);
    }
    for (let o of r) {
      let h = this.#t.get(o), a = h?.[0];
      if (!(!h || !(a instanceof Set)))
        if (a.size === 1 && h.length === 1) {
          this.#t.delete(o);
          continue;
        } else if (a.size === 1) {
          h.shift();
          let l = h[0];
          typeof l == "function" && n.add(l);
        } else
          a.delete(t);
    }
    return this.#s.delete(t), n.forEach((o) => this.#r(o)), true;
  }
};
var _r = () => process.umask();
var Or = Symbol("onEntry");
var Rs = Symbol("checkFs");
var Tr = Symbol("checkFs2");
var gs = Symbol("isReusable");
var P = Symbol("makeFs");
var bs = Symbol("file");
var _s = Symbol("directory");
var Ri = Symbol("link");
var xr = Symbol("symlink");
var Lr = Symbol("hardlink");
var Re = Symbol("ensureNoSymlink");
var Nr = Symbol("unsupported");
var Dr = Symbol("checkPath");
var ws = Symbol("stripAbsolutePath");
var yt = Symbol("mkdir");
var O = Symbol("onError");
var yi = Symbol("pending");
var Ar = Symbol("pend");
var Xt = Symbol("unpend");
var Ss = Symbol("ended");
var ys = Symbol("maybeClose");
var Os = Symbol("skip");
var ge = Symbol("doChown");
var be = Symbol("uid");
var _e = Symbol("gid");
var Oe = Symbol("checkedCwd");
var no = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
var Te = no === "win32";
var oo = 1024;
var ho = (s3, t) => {
  if (!Te)
    return u.unlink(s3, t);
  let e = s3 + ".DELETE." + Cr(16).toString("hex");
  u.rename(s3, e, (i) => {
    if (i)
      return t(i);
    u.unlink(e, t);
  });
};
var ao = (s3) => {
  if (!Te)
    return u.unlinkSync(s3);
  let t = s3 + ".DELETE." + Cr(16).toString("hex");
  u.renameSync(s3, t), u.unlinkSync(t);
};
var Ir = (s3, t, e) => s3 !== undefined && s3 === s3 >>> 0 ? s3 : t !== undefined && t === t >>> 0 ? t : e;
var qt = class extends st {
  [Ss] = false;
  [Oe] = false;
  [yi] = 0;
  reservations = new Si;
  transform;
  writable = true;
  readable = false;
  uid;
  gid;
  setOwner;
  preserveOwner;
  processGid;
  processUid;
  maxDepth;
  forceChown;
  win32;
  newer;
  keep;
  noMtime;
  preservePaths;
  unlink;
  cwd;
  strip;
  processUmask;
  umask;
  dmode;
  fmode;
  chmod;
  constructor(t = {}) {
    if (t.ondone = () => {
      this[Ss] = true, this[ys]();
    }, super(t), this.transform = t.transform, this.chmod = !!t.chmod, typeof t.uid == "number" || typeof t.gid == "number") {
      if (typeof t.uid != "number" || typeof t.gid != "number")
        throw new TypeError("cannot set owner without number uid and gid");
      if (t.preserveOwner)
        throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
      this.uid = t.uid, this.gid = t.gid, this.setOwner = true;
    } else
      this.uid = undefined, this.gid = undefined, this.setOwner = false;
    this.preserveOwner = t.preserveOwner === undefined && typeof t.uid != "number" ? !!(process.getuid && process.getuid() === 0) : !!t.preserveOwner, this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : undefined, this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : undefined, this.maxDepth = typeof t.maxDepth == "number" ? t.maxDepth : oo, this.forceChown = t.forceChown === true, this.win32 = !!t.win32 || Te, this.newer = !!t.newer, this.keep = !!t.keep, this.noMtime = !!t.noMtime, this.preservePaths = !!t.preservePaths, this.unlink = !!t.unlink, this.cwd = f(R.resolve(t.cwd || process.cwd())), this.strip = Number(t.strip) || 0, this.processUmask = this.chmod ? typeof t.processUmask == "number" ? t.processUmask : _r() : 0, this.umask = typeof t.umask == "number" ? t.umask : this.processUmask, this.dmode = t.dmode || 511 & ~this.umask, this.fmode = t.fmode || 438 & ~this.umask, this.on("entry", (e) => this[Or](e));
  }
  warn(t, e, i = {}) {
    return (t === "TAR_BAD_ARCHIVE" || t === "TAR_ABORT") && (i.recoverable = false), super.warn(t, e, i);
  }
  [ys]() {
    this[Ss] && this[yi] === 0 && (this.emit("prefinish"), this.emit("finish"), this.emit("end"));
  }
  [ws](t, e) {
    let i = t[e], { type: r } = t;
    if (!i || this.preservePaths)
      return true;
    let [n, o] = ce(i), h = o.replaceAll(/\\/g, "/").split("/");
    if (h.includes("..") || Te && /^[a-z]:\.\.$/i.test(h[0] ?? "")) {
      if (e === "path" || r === "Link")
        return this.warn("TAR_ENTRY_ERROR", `${e} contains '..'`, { entry: t, [e]: i }), false;
      let a = R.posix.dirname(t.path), l = R.posix.normalize(R.posix.join(a, h.join("/")));
      if (l.startsWith("../") || l === "..")
        return this.warn("TAR_ENTRY_ERROR", `${e} escapes extraction directory`, { entry: t, [e]: i }), false;
    }
    return n && (t[e] = String(o), this.warn("TAR_ENTRY_INFO", `stripping ${n} from absolute ${e}`, { entry: t, [e]: i })), true;
  }
  [Dr](t) {
    let e = f(t.path), i = e.split("/");
    if (this.strip) {
      if (i.length < this.strip)
        return false;
      if (t.type === "Link") {
        let r = f(String(t.linkpath)).split("/");
        if (r.length >= this.strip)
          t.linkpath = r.slice(this.strip).join("/");
        else
          return false;
      }
      i.splice(0, this.strip), t.path = i.join("/");
    }
    if (isFinite(this.maxDepth) && i.length > this.maxDepth)
      return this.warn("TAR_ENTRY_ERROR", "path excessively deep", { entry: t, path: e, depth: i.length, maxDepth: this.maxDepth }), false;
    if (!this[ws](t, "path") || !this[ws](t, "linkpath"))
      return false;
    if (t.absolute = R.isAbsolute(t.path) ? f(R.resolve(t.path)) : f(R.resolve(this.cwd, t.path)), !this.preservePaths && typeof t.absolute == "string" && t.absolute.indexOf(this.cwd + "/") !== 0 && t.absolute !== this.cwd)
      return this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", { entry: t, path: f(t.path), resolvedPath: t.absolute, cwd: this.cwd }), false;
    if (t.absolute === this.cwd && t.type !== "Directory" && t.type !== "GNUDumpDir")
      return false;
    if (this.win32) {
      let { root: r } = R.win32.parse(String(t.absolute));
      t.absolute = r + Qi(String(t.absolute).slice(r.length));
      let { root: n } = R.win32.parse(t.path);
      t.path = n + Qi(t.path.slice(n.length));
    }
    return true;
  }
  [Or](t) {
    if (!this[Dr](t))
      return t.resume();
    switch (ro.equal(typeof t.absolute, "string"), t.type) {
      case "Directory":
      case "GNUDumpDir":
        t.mode && (t.mode = t.mode | 448);
      case "File":
      case "OldFile":
      case "ContiguousFile":
      case "Link":
      case "SymbolicLink":
        return this[Rs](t);
      default:
        return this[Nr](t);
    }
  }
  [O](t, e) {
    t.name === "CwdError" ? this.emit("error", t) : (this.warn("TAR_ENTRY_ERROR", t, { entry: e }), this[Xt](), e.resume());
  }
  [yt](t, e, i) {
    wr(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e }, i);
  }
  [ge](t) {
    return this.forceChown || this.preserveOwner && (typeof t.uid == "number" && t.uid !== this.processUid || typeof t.gid == "number" && t.gid !== this.processGid) || typeof this.uid == "number" && this.uid !== this.processUid || typeof this.gid == "number" && this.gid !== this.processGid;
  }
  [be](t) {
    return Ir(this.uid, t.uid, this.processUid);
  }
  [_e](t) {
    return Ir(this.gid, t.gid, this.processGid);
  }
  [bs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = new tt(String(t.absolute), { flags: fs(t.size), mode: i, autoClose: false });
    r.on("error", (a) => {
      r.fd && u.close(r.fd, () => {}), r.write = () => true, this[O](a, t), e();
    });
    let n = 1, o = (a) => {
      if (a) {
        r.fd && u.close(r.fd, () => {}), this[O](a, t), e();
        return;
      }
      --n === 0 && r.fd !== undefined && u.close(r.fd, (l) => {
        l ? this[O](l, t) : this[Xt](), e();
      });
    };
    r.on("finish", () => {
      let a = String(t.absolute), l = r.fd;
      if (typeof l == "number" && t.mtime && !this.noMtime) {
        n++;
        let c = t.atime || new Date, d = t.mtime;
        u.futimes(l, c, d, (S) => S ? u.utimes(a, c, d, (T) => o(T && S)) : o());
      }
      if (typeof l == "number" && this[ge](t)) {
        n++;
        let c = this[be](t), d = this[_e](t);
        typeof c == "number" && typeof d == "number" && u.fchown(l, c, d, (S) => S ? u.chown(a, c, d, (T) => o(T && S)) : o());
      }
      o();
    });
    let h = this.transform && this.transform(t) || t;
    h !== t && (h.on("error", (a) => {
      this[O](a, t), e();
    }), t.pipe(h)), h.pipe(r);
  }
  [_s](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode;
    this[yt](String(t.absolute), i, (r) => {
      if (r) {
        this[O](r, t), e();
        return;
      }
      let n = 1, o = () => {
        --n === 0 && (e(), this[Xt](), t.resume());
      };
      t.mtime && !this.noMtime && (n++, u.utimes(String(t.absolute), t.atime || new Date, t.mtime, o)), this[ge](t) && (n++, u.chown(String(t.absolute), Number(this[be](t)), Number(this[_e](t)), o)), o();
    });
  }
  [Nr](t) {
    t.unsupported = true, this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${t.type}`, { entry: t }), t.resume();
  }
  [xr](t, e) {
    let i = f(R.relative(this.cwd, R.resolve(R.dirname(String(t.absolute)), String(t.linkpath)))).split("/");
    this[Re](t, this.cwd, i, () => this[Ri](t, String(t.linkpath), "symlink", e), (r) => {
      this[O](r, t), e();
    });
  }
  [Lr](t, e) {
    let i = f(R.resolve(this.cwd, String(t.linkpath))), r = f(String(t.linkpath)).split("/");
    this[Re](t, this.cwd, r, () => this[Ri](t, i, "link", e), (n) => {
      this[O](n, t), e();
    });
  }
  [Re](t, e, i, r, n) {
    let o = i.shift();
    if (this.preservePaths || o === undefined)
      return r();
    let h = R.resolve(e, o);
    u.lstat(h, (a, l) => {
      if (a)
        return r();
      if (l?.isSymbolicLink())
        return n(new St(h, R.resolve(h, i.join("/"))));
      this[Re](t, h, i, r, n);
    });
  }
  [Ar]() {
    this[yi]++;
  }
  [Xt]() {
    this[yi]--, this[ys]();
  }
  [Os](t) {
    this[Xt](), t.resume();
  }
  [gs](t, e) {
    return t.type === "File" && !this.unlink && e.isFile() && e.nlink <= 1 && !Te;
  }
  [Rs](t) {
    this[Ar]();
    let e = [t.path];
    t.linkpath && e.push(t.linkpath), this.reservations.reserve(e, (i) => this[Tr](t, i));
  }
  [Tr](t, e) {
    let i = (h) => {
      e(h);
    }, r = () => {
      this[yt](this.cwd, this.dmode, (h) => {
        if (h) {
          this[O](h, t), i();
          return;
        }
        this[Oe] = true, n();
      });
    }, n = () => {
      if (t.absolute !== this.cwd) {
        let h = f(R.dirname(String(t.absolute)));
        if (h !== this.cwd)
          return this[yt](h, this.dmode, (a) => {
            if (a) {
              this[O](a, t), i();
              return;
            }
            o();
          });
      }
      o();
    }, o = () => {
      u.lstat(String(t.absolute), (h, a) => {
        if (a && (this.keep || this.newer && a.mtime > (t.mtime ?? a.mtime))) {
          this[Os](t), i();
          return;
        }
        if (h || this[gs](t, a))
          return this[P](null, t, i);
        if (a.isDirectory()) {
          if (t.type === "Directory") {
            let l = this.chmod && t.mode && (a.mode & 4095) !== t.mode, c = (d) => this[P](d ?? null, t, i);
            return l ? u.chmod(String(t.absolute), Number(t.mode), c) : c();
          }
          if (t.absolute !== this.cwd)
            return u.rmdir(String(t.absolute), (l) => this[P](l ?? null, t, i));
        }
        if (t.absolute === this.cwd)
          return this[P](null, t, i);
        ho(String(t.absolute), (l) => this[P](l ?? null, t, i));
      });
    };
    this[Oe] ? n() : r();
  }
  [P](t, e, i) {
    if (t) {
      this[O](t, e), i();
      return;
    }
    switch (e.type) {
      case "File":
      case "OldFile":
      case "ContiguousFile":
        return this[bs](e, i);
      case "Link":
        return this[Lr](e, i);
      case "SymbolicLink":
        return this[xr](e, i);
      case "Directory":
      case "GNUDumpDir":
        return this[_s](e, i);
    }
  }
  [Ri](t, e, i, r) {
    u[i](e, String(t.absolute), (n) => {
      n ? this[O](n, t) : (this[Xt](), t.resume()), r();
    });
  }
};
var ye = (s3) => {
  try {
    return [null, s3()];
  } catch (t) {
    return [t, null];
  }
};
var xe = class extends qt {
  sync = true;
  [P](t, e) {
    return super[P](t, e, () => {});
  }
  [Rs](t) {
    if (!this[Oe]) {
      let n = this[yt](this.cwd, this.dmode);
      if (n)
        return this[O](n, t);
      this[Oe] = true;
    }
    if (t.absolute !== this.cwd) {
      let n = f(R.dirname(String(t.absolute)));
      if (n !== this.cwd) {
        let o = this[yt](n, this.dmode);
        if (o)
          return this[O](o, t);
      }
    }
    let [e, i] = ye(() => u.lstatSync(String(t.absolute)));
    if (i && (this.keep || this.newer && i.mtime > (t.mtime ?? i.mtime)))
      return this[Os](t);
    if (e || this[gs](t, i))
      return this[P](null, t);
    if (i.isDirectory()) {
      if (t.type === "Directory") {
        let o = this.chmod && t.mode && (i.mode & 4095) !== t.mode, [h] = o ? ye(() => {
          u.chmodSync(String(t.absolute), Number(t.mode));
        }) : [];
        return this[P](h, t);
      }
      let [n] = ye(() => u.rmdirSync(String(t.absolute)));
      this[P](n, t);
    }
    let [r] = t.absolute === this.cwd ? [] : ye(() => ao(String(t.absolute)));
    this[P](r, t);
  }
  [bs](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.fmode, r = (h) => {
      let a;
      try {
        u.closeSync(n);
      } catch (l) {
        a = l;
      }
      (h || a) && this[O](h || a, t), e();
    }, n;
    try {
      n = u.openSync(String(t.absolute), fs(t.size), i);
    } catch (h) {
      return r(h);
    }
    let o = this.transform && this.transform(t) || t;
    o !== t && (o.on("error", (h) => this[O](h, t)), t.pipe(o)), o.on("data", (h) => {
      try {
        u.writeSync(n, h, 0, h.length);
      } catch (a) {
        r(a);
      }
    }), o.on("end", () => {
      let h = null;
      if (t.mtime && !this.noMtime) {
        let a = t.atime || new Date, l = t.mtime;
        try {
          u.futimesSync(n, a, l);
        } catch (c) {
          try {
            u.utimesSync(String(t.absolute), a, l);
          } catch {
            h = c;
          }
        }
      }
      if (this[ge](t)) {
        let a = this[be](t), l = this[_e](t);
        try {
          u.fchownSync(n, Number(a), Number(l));
        } catch (c) {
          try {
            u.chownSync(String(t.absolute), Number(a), Number(l));
          } catch {
            h = h || c;
          }
        }
      }
      r(h);
    });
  }
  [_s](t, e) {
    let i = typeof t.mode == "number" ? t.mode & 4095 : this.dmode, r = this[yt](String(t.absolute), i);
    if (r) {
      this[O](r, t), e();
      return;
    }
    if (t.mtime && !this.noMtime)
      try {
        u.utimesSync(String(t.absolute), t.atime || new Date, t.mtime);
      } catch {}
    if (this[ge](t))
      try {
        u.chownSync(String(t.absolute), Number(this[be](t)), Number(this[_e](t)));
      } catch {}
    e(), t.resume();
  }
  [yt](t, e) {
    try {
      return yr(f(t), { uid: this.uid, gid: this.gid, processUid: this.processUid, processGid: this.processGid, umask: this.processUmask, preserve: this.preservePaths, unlink: this.unlink, cwd: this.cwd, mode: e });
    } catch (i) {
      return i;
    }
  }
  [Re](t, e, i, r, n) {
    if (this.preservePaths || i.length === 0)
      return r();
    let o = e;
    for (let h of i) {
      o = R.resolve(o, h);
      let [a, l] = ye(() => u.lstatSync(o));
      if (a)
        return r();
      if (l.isSymbolicLink())
        return n(new St(o, R.resolve(e, i.join("/"))));
    }
    r();
  }
  [Ri](t, e, i, r) {
    let n = `${i}Sync`;
    try {
      u[n](e, String(t.absolute)), r(), t.resume();
    } catch (o) {
      return this[O](o, t);
    }
  }
};
var lo = (s3) => {
  let t = new xe(s3), e = s3.file, i = kr.statSync(e), r = s3.maxReadSize || 16 * 1024 * 1024;
  new Be(e, { readSize: r, size: i.size }).pipe(t);
};
var co = (s3, t) => {
  let e = new qt(s3), i = s3.maxReadSize || 16 * 1024 * 1024, r = s3.file;
  return new Promise((o, h) => {
    e.on("error", h), e.on("close", o), kr.stat(r, (a, l) => {
      if (a)
        h(a);
      else {
        let c = new _t(r, { readSize: i, size: l.size });
        c.on("error", h), c.pipe(e);
      }
    });
  });
};
var fo = K(lo, co, (s3) => new xe(s3), (s3) => new qt(s3), (s3, t) => {
  t?.length && $i(s3, t);
});
var uo = (s3, t) => {
  let e = new Ft(s3), i = true, r, n;
  try {
    try {
      r = v.openSync(s3.file, "r+");
    } catch (a) {
      if (a?.code === "ENOENT")
        r = v.openSync(s3.file, "w+");
      else
        throw a;
    }
    let o = v.fstatSync(r), h = Buffer.alloc(512);
    t:
      for (n = 0;n < o.size; n += 512) {
        for (let c = 0, d = 0;c < 512; c += d) {
          if (d = v.readSync(r, h, c, h.length - c, n + c), n === 0 && h[0] === 31 && h[1] === 139)
            throw new Error("cannot append to compressed archives");
          if (!d)
            break t;
        }
        let a = new k(h);
        if (!a.cksumValid)
          break;
        let l = 512 * Math.ceil((a.size || 0) / 512);
        if (n + l + 512 > o.size)
          break;
        n += l, s3.mtimeCache && a.mtime && s3.mtimeCache.set(String(a.path), a.mtime);
      }
    i = false, mo(s3, e, n, r, t);
  } finally {
    if (i)
      try {
        v.closeSync(r);
      } catch {}
  }
};
var mo = (s3, t, e, i, r) => {
  let n = new Wt(s3.file, { fd: i, start: e });
  t.pipe(n), Eo(t, r);
};
var po = (s3, t) => {
  t = Array.from(t);
  let e = new wt(s3), i = (n, o, h) => {
    let a = (T, N) => {
      T ? v.close(n, (E) => h(T)) : h(null, N);
    }, l = 0;
    if (o === 0)
      return a(null, 0);
    let c = 0, d = Buffer.alloc(512), S = (T, N) => {
      if (T || N === undefined)
        return a(T);
      if (c += N, c < 512 && N)
        return v.read(n, d, c, d.length - c, l + c, S);
      if (l === 0 && d[0] === 31 && d[1] === 139)
        return a(new Error("cannot append to compressed archives"));
      if (c < 512)
        return a(null, l);
      let E = new k(d);
      if (!E.cksumValid)
        return a(null, l);
      let x = 512 * Math.ceil((E.size ?? 0) / 512);
      if (l + x + 512 > o || (l += x + 512, l >= o))
        return a(null, l);
      s3.mtimeCache && E.mtime && s3.mtimeCache.set(String(E.path), E.mtime), c = 0, v.read(n, d, 0, 512, l, S);
    };
    v.read(n, d, 0, 512, l, S);
  };
  return new Promise((n, o) => {
    e.on("error", o);
    let h = "r+", a = (l, c) => {
      if (l && l.code === "ENOENT" && h === "r+")
        return h = "w+", v.open(s3.file, h, a);
      if (l || !c)
        return o(l);
      v.fstat(c, (d, S) => {
        if (d)
          return v.close(c, () => o(d));
        i(c, S.size, (T, N) => {
          if (T)
            return o(T);
          let E = new tt(s3.file, { fd: c, start: N });
          e.pipe(E), E.on("error", o), E.on("close", n), wo(e, t);
        });
      });
    };
    v.open(s3.file, h, a);
  });
};
var Eo = (s3, t) => {
  t.forEach((e) => {
    e.charAt(0) === "@" ? Ct({ file: Fr.resolve(s3.cwd, e.slice(1)), sync: true, noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  }), s3.end();
};
var wo = async (s3, t) => {
  for (let e of t)
    e.charAt(0) === "@" ? await Ct({ file: Fr.resolve(String(s3.cwd), e.slice(1)), noResume: true, onReadEntry: (i) => s3.add(i) }) : s3.add(e);
  s3.end();
};
var vt = K(uo, po, () => {
  throw new TypeError("file is required");
}, () => {
  throw new TypeError("file is required");
}, (s3, t) => {
  if (!Fs(s3))
    throw new TypeError("file is required");
  if (s3.gzip || s3.brotli || s3.zstd || s3.file.endsWith(".br") || s3.file.endsWith(".tbr"))
    throw new TypeError("cannot append to compressed archives");
  if (!t?.length)
    throw new TypeError("no paths specified to add/replace");
});
var So = K(vt.syncFile, vt.asyncFile, vt.syncNoFile, vt.asyncNoFile, (s3, t = []) => {
  vt.validate?.(s3, t), yo(s3);
});
var yo = (s3) => {
  let t = s3.filter;
  s3.mtimeCache || (s3.mtimeCache = new Map), s3.filter = t ? (e, i) => t(e, i) && !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0)) : (e, i) => !((s3.mtimeCache?.get(e) ?? i.mtime ?? 0) > (i.mtime ?? 0));
};

// src/utils/download.ts
async function downloadFileWithProgressTrackerAsync(url, outputPath, progressTrackerMessage, progressTrackerCompletedMessage, { fetch: fetchInstance = fetch } = {}) {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true });
    const response = await fetchInstance(url, {
      signal: AbortSignal.timeout(1000 * 60 * 5)
    });
    if (!response.ok) {
      throw new Error(`Failed to download file from ${url}`);
    }
    const total = Number(response.headers.get("content-length"));
    if (typeof progressTrackerMessage === "function" && Number.isFinite(total) && total > 0) {
      progressTrackerMessage(1, total);
    } else if (typeof progressTrackerMessage === "string") {}
    await Bun.write(outputPath, response);
  } catch (error) {
    await rm(outputPath, { force: true, recursive: true });
    throw error;
  }
}
async function extractArchiveAsync(input, output) {
  try {
    const subprocess = Bun.spawn(["tar", "-xf", input, "-C", output], {
      stderr: "inherit",
      stdout: "inherit"
    });
    const exitCode = await subprocess.exited;
    if (exitCode === 0) {
      return;
    }
  } catch {}
  await fo({ cwd: output, file: input });
}

// src/utils/files.ts
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

// src/utils/paths.ts
import { homedir, tmpdir } from "os";
import path2 from "path";
function getExpoHomeDirectory() {
  if (process.env.EXPO_HOME) {
    return process.env.EXPO_HOME;
  }
  const home = homedir();
  if (!home) {
    throw new Error("Can't determine your home directory; make sure your $HOME environment variable is set.");
  }
  if (process.env.EXPO_STAGING) {
    return path2.join(home, ".expo-staging");
  } else if (process.env.EXPO_LOCAL) {
    return path2.join(home, ".expo-local");
  }
  return path2.join(home, ".expo");
}
function getTmpDirectory() {
  return path2.join(tmpdir(), "expo-go");
}

// src/utils/expoGo.ts
var SIX_MONTHS_IN_MS = 6 * 30 * 24 * 60 * 60 * 1000;
var platformSettings = {
  ios: {
    versionsKey: "iosClientUrl",
    extension: "app",
    shouldExtractResults: true,
    getFilePath: (filename) => path3.join(getExpoHomeDirectory(), "ios-simulator-app-cache", `${filename}.app`)
  },
  android: {
    versionsKey: "androidClientUrl",
    extension: "apk",
    shouldExtractResults: false,
    getFilePath: (filename) => path3.join(getExpoHomeDirectory(), "android-apk-cache", `${filename}.apk`)
  }
};
function getUrlBasename(url) {
  try {
    return path3.basename(new URL(url).pathname);
  } catch {
    return path3.basename(url.split("?")[0] ?? url);
  }
}
function formatHomePath(filePath) {
  const homeDirectory = homedir2();
  if (!homeDirectory || !filePath.startsWith(homeDirectory)) {
    return filePath;
  }
  return path3.join("~", path3.relative(homeDirectory, filePath));
}
async function pathExistsAsync(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
async function readJsonConfigAsync(filePath) {
  const file = Bun.file(filePath);
  if (!await file.exists()) {
    return null;
  }
  try {
    return await file.json();
  } catch {
    return null;
  }
}
async function detectProjectSdkVersionAsync(projectDir) {
  const candidates = ["app.json", "app.config.json"];
  for (const candidate of candidates) {
    const config = await readJsonConfigAsync(path3.join(projectDir, candidate));
    if (!config || typeof config !== "object") {
      continue;
    }
    const maybeExpoConfig = "expo" in config ? config.expo : config;
    if (maybeExpoConfig && typeof maybeExpoConfig === "object" && "sdkVersion" in maybeExpoConfig && typeof maybeExpoConfig.sdkVersion === "string") {
      return maybeExpoConfig.sdkVersion;
    }
  }
}
function normalizeSdkVersion(sdkVersion) {
  if (sdkVersion.toUpperCase() === "UNVERSIONED") {
    return "UNVERSIONED";
  } else if (/^\d+$/.test(sdkVersion)) {
    return `${sdkVersion}.0.0`;
  } else if (/^\d+\.\d+$/.test(sdkVersion)) {
    return `${sdkVersion}.0`;
  }
  return sdkVersion;
}
function isSdkVersionInput(value) {
  const normalized = value.toUpperCase();
  return normalized === "UNVERSIONED" || normalized === "LATEST" || /^\d+(\.\d+){0,2}$/.test(value);
}
async function getVersionsAsync() {
  const response = await apiGetAsync("versions/latest");
  const data = response && typeof response === "object" && "data" in response ? response.data : response;
  if (!data || typeof data !== "object" || !("sdkVersions" in data) || typeof data.sdkVersions !== "object" || !data.sdkVersions) {
    throw new Error("Unexpected response when fetching version info from Expo servers.");
  }
  return data;
}
function getLatestSdkVersion(sdkVersions) {
  const latestVersion = Object.keys(sdkVersions).filter((version) => import_semver.default.valid(version)).reduce((latest, version) => import_semver.default.gt(version, latest) ? version : latest, "0.0.0");
  if (latestVersion === "0.0.0") {
    throw new Error("Unable to find a version of Expo Go.");
  }
  return latestVersion;
}
function getExpoGoVersionEntryFromVersions(sdkVersion, versions) {
  const normalizedSdkVersion = normalizeSdkVersion(sdkVersion);
  const upperSdkVersion = normalizedSdkVersion.toUpperCase();
  const resolvesToLatest = upperSdkVersion === "UNVERSIONED" || upperSdkVersion === "LATEST";
  const resolvedSdkVersion = resolvesToLatest ? getLatestSdkVersion(versions.sdkVersions) : normalizedSdkVersion;
  if (upperSdkVersion === "UNVERSIONED") {
    log_default.warn(`Downloading the latest Expo Go client (${resolvedSdkVersion}). This will not fully conform to UNVERSIONED.`);
  }
  const version = versions.sdkVersions[resolvedSdkVersion];
  if (!version) {
    throw new Error(`Unable to find a version of Expo Go for SDK ${normalizedSdkVersion}`);
  }
  return { sdkVersion: resolvedSdkVersion, version };
}
async function getExpoGoVersionEntryAsync(sdkVersion) {
  return getExpoGoVersionEntryFromVersions(sdkVersion, await getVersionsAsync());
}
async function getExpoGoDownloadUrlAsync(platform, {
  projectDir = process.cwd(),
  sdkVersion
} = {}) {
  const versions = await getVersionsAsync();
  const resolvedSdkVersion = sdkVersion ? normalizeSdkVersion(sdkVersion) : normalizeSdkVersion(await detectProjectSdkVersionAsync(projectDir) ?? getLatestSdkVersion(versions.sdkVersions));
  const { sdkVersion: matchingSdkVersion, version } = getExpoGoVersionEntryFromVersions(resolvedSdkVersion, versions);
  const versionsKey = platformSettings[platform].versionsKey;
  const url = version[versionsKey];
  if (typeof url !== "string" || !url) {
    throw new Error(`Unable to find an Expo Go ${platform} download URL for SDK ${matchingSdkVersion}`);
  }
  return { sdkVersion: matchingSdkVersion, url };
}
async function cleanupOldExpoGoCacheEntriesAsync(cacheDirectory, maxAgeMs = SIX_MONTHS_IN_MS) {
  let cacheEntries;
  try {
    cacheEntries = await readdir(cacheDirectory);
  } catch {
    return;
  }
  const now = Date.now();
  for (const entry of cacheEntries) {
    const filePath = path3.join(cacheDirectory, entry);
    try {
      const fileStat = await lstat(filePath);
      if (now - fileStat.mtimeMs > maxAgeMs) {
        log_default.debug(`Removing old Expo Go cache entry: ${filePath}`);
        await rm2(filePath, { force: true, recursive: true });
      }
    } catch {}
  }
}
async function downloadExpoGoAsync(platform, {
  projectDir = process.cwd(),
  sdkVersion,
  url
} = {}) {
  const result = url ? { sdkVersion: sdkVersion ? normalizeSdkVersion(sdkVersion) : "unknown", url } : await getExpoGoDownloadUrlAsync(platform, { projectDir, sdkVersion });
  const { getFilePath, shouldExtractResults } = platformSettings[platform];
  const filename = path3.parse(getUrlBasename(result.url)).name;
  const outputPath = getFilePath(filename);
  await cleanupOldExpoGoCacheEntriesAsync(path3.dirname(outputPath));
  if (await pathExistsAsync(outputPath)) {
    log_default.log(`Using cached version from ${bold(formatHomePath(path3.dirname(outputPath)))}`);
    return { ...result, path: outputPath };
  }
  await downloadAppAsync({
    extract: shouldExtractResults,
    outputPath,
    url: result.url
  });
  return { ...result, path: outputPath };
}
async function downloadAppAsync({
  url,
  outputPath,
  extract
}) {
  const fetchInstance = fetch;
  const progressMessage = (ratio, total) => `Downloading Expo Go (${formatBytes(total * ratio)} / ${formatBytes(total)})`;
  if (extract) {
    const tmpDir = path3.join(getTmpDirectory(), crypto.randomUUID());
    await mkdir2(tmpDir, { recursive: true });
    const tmpPath = path3.join(tmpDir, getUrlBasename(url));
    await downloadFileWithProgressTrackerAsync(url, tmpPath, progressMessage, "Successfully downloaded Expo Go", { showNewLine: false, fetch: fetchInstance });
    await rm2(outputPath, { force: true, recursive: true });
    await mkdir2(outputPath, { recursive: true });
    await extractArchiveAsync(tmpPath, outputPath);
  } else {
    await mkdir2(path3.dirname(outputPath), { recursive: true });
    await downloadFileWithProgressTrackerAsync(url, outputPath, progressMessage, "Successfully downloaded Expo Go", { showNewLine: false, fetch: fetchInstance });
  }
}
async function copyExpoGoToPathAsync({
  destinationPath,
  platform,
  sourcePath
}) {
  const outputPath = await resolveExpoGoOutputPathAsync({
    destinationPath,
    platform,
    sourcePath
  });
  if (path3.resolve(sourcePath) === path3.resolve(outputPath)) {
    return outputPath;
  }
  await mkdir2(path3.dirname(outputPath), { recursive: true });
  await rm2(outputPath, { force: true, recursive: true });
  await cp(sourcePath, outputPath, { recursive: true });
  return outputPath;
}
async function resolveExpoGoOutputPathAsync({
  destinationPath,
  platform,
  sourcePath
}) {
  if (!destinationPath) {
    return path3.join(process.cwd(), path3.basename(sourcePath));
  }
  const resolvedDestinationPath = path3.resolve(destinationPath);
  const extension = platformSettings[platform].extension;
  if (resolvedDestinationPath.endsWith(`.${extension}`)) {
    return resolvedDestinationPath;
  }
  const destinationStat = await stat(resolvedDestinationPath).catch(() => null);
  if (!destinationStat || destinationStat.isDirectory()) {
    return path3.join(resolvedDestinationPath, path3.basename(sourcePath));
  }
  return resolvedDestinationPath;
}

// src/cli.ts
var defaultCliDependencies = {
  copyExpoGoToPathAsync,
  downloadExpoGoAsync,
  getExpoGoDownloadUrlAsync,
  log: log_default.log
};
var HELP = `Usage: expo-go [command]

Get Expo Go download URLs and binaries

Commands:
  url <platform> [sdkVersion]                    print the Expo Go download URL for a platform
  download <platform> [sdkVersion] [outputPath]  download Expo Go for a platform

Run "expo-go help <command>" for command details.`;
var COMMAND_HELP = {
  url: `Usage: expo-go url <platform> [sdkVersion]

Print the Expo Go download URL for a platform.

Arguments:
  platform    ios or android
  sdkVersion  Expo SDK version, or "latest". Defaults to the current project SDK, or latest.`,
  download: `Usage: expo-go download <platform> [sdkVersion] [outputPath]

Download Expo Go for a platform.

Arguments:
  platform    ios or android
  sdkVersion  Expo SDK version, or "latest". Defaults to the current project SDK, or latest.
  outputPath  Output path. Defaults to the current directory. Pass an SDK version (or "latest") to use it.`
};
function toUserArgs(argv, from) {
  return from === "user" ? argv : argv.slice(2);
}
function assertPlatform(value) {
  if (value === "ios" || value === "android") {
    return value;
  }
  throw new Error('Expected platform to be "ios" or "android".');
}
function isHelpToken(value) {
  return value === "-h" || value === "--help";
}
function assertNoExtraArgs(command, args, max) {
  if (args.length > max) {
    throw new Error(`Too many arguments for "${command}".`);
  }
}
async function runCliAsync(argv = process.argv, deps = defaultCliDependencies, options) {
  options?.exitOverride;
  const [command, ...args] = toUserArgs(argv, options?.from);
  if (!command || isHelpToken(command)) {
    deps.log(HELP);
    return;
  }
  if (command === "help") {
    const commandName = args[0];
    deps.log(commandName && COMMAND_HELP[commandName] ? COMMAND_HELP[commandName] : HELP);
    return;
  }
  if (command === "url") {
    if (isHelpToken(args[0])) {
      deps.log(COMMAND_HELP.url);
      return;
    }
    assertNoExtraArgs(command, args, 2);
    const platform = assertPlatform(args[0]);
    const sdkVersion = args[1];
    const { url } = await deps.getExpoGoDownloadUrlAsync(platform, { sdkVersion });
    deps.log(url);
    return;
  }
  if (command === "download") {
    if (isHelpToken(args[0])) {
      deps.log(COMMAND_HELP.download);
      return;
    }
    assertNoExtraArgs(command, args, 3);
    const platform = assertPlatform(args[0]);
    const sdkVersion = args[1];
    const outputPath = args[2];
    if (sdkVersion && !isSdkVersionInput(sdkVersion)) {
      throw new Error(`Expected "${sdkVersion}" to be an Expo SDK version or "latest". Pass "latest" as the SDK version to download the default Expo Go to a specific output path.`);
    }
    const download = await deps.downloadExpoGoAsync(platform, { sdkVersion });
    const copiedPath = await deps.copyExpoGoToPathAsync({
      destinationPath: outputPath,
      platform,
      sourcePath: download.path
    });
    deps.log(`Expo Go downloaded to ${bold(copiedPath)}`);
    return;
  }
  throw new Error(`Unknown command "${command}".`);
}

// index.ts
if (import.meta.main) {
  try {
    await runCliAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}
export {
  runCliAsync,
  normalizeSdkVersion,
  isSdkVersionInput,
  getVersionsAsync,
  getLatestSdkVersion,
  getExpoGoVersionEntryFromVersions,
  getExpoGoVersionEntryAsync,
  getExpoGoDownloadUrlAsync,
  downloadExpoGoAsync,
  detectProjectSdkVersionAsync,
  defaultCliDependencies,
  copyExpoGoToPathAsync,
  cleanupOldExpoGoCacheEntriesAsync
};
