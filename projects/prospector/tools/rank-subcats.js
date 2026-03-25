var fs = require("fs");
var dir = "P:/Projects2/sg-general-agents/projects/prospector/outputs/problem-heatmap/";
var files = fs.readdirSync(dir).filter(function(f) { return f.endsWith(".json"); });
var domainSubs = {};

files.forEach(function(f) {
  var hm = JSON.parse(fs.readFileSync(dir + f, "utf-8"));
  Object.keys(hm.domains).forEach(function(domId) {
    var dom = hm.domains[domId];
    if (!domainSubs[domId]) domainSubs[domId] = { label: dom.domain_label, subs: {} };
    if (dom.sub_categories) {
      Object.keys(dom.sub_categories).forEach(function(subId) {
        var sub = dom.sub_categories[subId];
        if (!domainSubs[domId].subs[subId]) domainSubs[domId].subs[subId] = { label: sub.label, scores: [] };
        domainSubs[domId].subs[subId].scores.push(sub.sub_avg);
      });
    }
  });
});

var rows = [];
Object.keys(domainSubs).forEach(function(domId) {
  var dom = domainSubs[domId];
  Object.keys(dom.subs).forEach(function(subId) {
    var sub = dom.subs[subId];
    var avg = sub.scores.reduce(function(a,b){return a+b;},0) / sub.scores.length;
    var hot = sub.scores.filter(function(s){return s >= 0.5;}).length;
    rows.push({ domain: dom.label, sub: sub.label, avg: avg, hot: hot });
  });
});

rows.sort(function(a,b) { return b.avg - a.avg; });
console.log("RANK | AVG | HOT/8 | DOMAIN > SUB-CATEGORY");
console.log("-----|-----|-------|----------------------");
rows.forEach(function(r, i) {
  console.log(String(i+1).padStart(4) + " | " + (r.avg*100).toFixed(0).padStart(3) + " | " + r.hot + "/8   | " + r.domain + " > " + r.sub);
});
