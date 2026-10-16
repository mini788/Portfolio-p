const experiments = {
  relevance: {
    names: ['Lexical baseline', 'Naïve hybrid v1', 'Intent-aware v2'],
    metrics: {
      ndcg: {label:'Semantic NDCG@10',values:[0.58,0.71,0.69],max:1,format:'decimal',direction:'Higher is better',note:'v1 gains about 22% relative semantic relevance, but loses exact-match precision. v2 keeps most of that gain while protecting known-item search. All values are simulated.'},
      recall: {label:'Semantic Recall@10',values:[0.65,0.80,0.78],max:1,format:'percent',direction:'Higher is better',note:'v2 retrieves more paraphrased sources than the baseline, with a small recall trade-off versus v1. This synthetic benchmark does not establish real-user task success.'},
      exact: {label:'Known-item Success@1',values:[0.92,0.85,0.93],max:1,format:'percent',direction:'Higher is better',gate:0.91,note:'Assumed gate: no more than a 1 percentage-point decline from the 92% baseline. v1 fails at 85%; v2 restores exact-item precision to 93% in the simulated retest.'},
      metadata: {label:'Metadata constraint precision',values:[0.96,0.93,0.97],max:1,format:'percent',direction:'Higher is better',note:'Signed status, dates, and authorization remain hard constraints. The simulated v2 improves metadata precision; semantic similarity cannot replace authoritative metadata.'},
      latency: {label:'p95 response time',values:[230,720,490],max:1000,format:'ms',direction:'Lower is better',gate:650,note:'Assumed latency budget: 650 ms. v1 exceeds it at 720 ms; selective reranking and intent-based routing bring the simulated v2 to 490 ms.'},
      cost: {label:'Relative cost per query',values:[1,2.1,1.6],max:3,format:'cost',direction:'Lower is better',gate:2,note:'Assumed cost ceiling: 2× the lexical baseline. v1 exceeds the ceiling at 2.1×; the narrower v2 route is 1.6× in this simulated scenario.'}
    }
  },
  platform: {
    names: ['Document baseline', 'Naïve unified v1', 'Corrected v2'],
    metrics: {
      coverage: {label:'Required-source coverage',values:[62,91,90],max:100,format:'wholePercent',direction:'Higher is better',gate:90,note:'Assumed coverage gate: at least 90%. v1 indexes more required sources but fails trust and quality gates. v2 prioritizes a dependable source contract over expanding coverage.'},
      ndcg: {label:'Cross-source NDCG@10',values:[0.72,0.60,0.75],max:1,format:'decimal',direction:'Higher is better',note:'Adding content alone makes ranking worse in v1. Evaluated score fusion and reliable matter relationships restore relevance in the hypothetical v2.'},
      evidence: {label:'All-required-evidence@10',values:[44,56,87],max:100,format:'wholePercent',direction:'Higher is better',gate:85,note:'Assumed completeness gate: at least 85%. The corrected v2 reaches 87% in the simulated benchmark. A plausible result is insufficient if another required source is missing.'},
      matter: {label:'Matter association accuracy',values:[98,89,99],max:100,format:'wholePercent',direction:'Higher is better',gate:90,note:'Assumed gate: at least 90%. v1 fails at 89%. v2 uses authoritative record and matter IDs; it does not guess associations from names or semantic similarity.'},
      freshness: {label:'Updates within freshness objective',values:[97,88,96],max:100,format:'wholePercent',direction:'Higher is better',gate:95,note:'Assumed freshness gate: at least 95%. Replay-safe events, deletion tombstones, and reconciliation address lifecycle failures before new integrations.'},
      latency: {label:'p95 response time',values:[260,810,540],max:1000,format:'ms',direction:'Lower is better',note:'The corrected v2 is faster than v1 in the simulation. No platform-specific latency release threshold is specified in the study; an actual budget needs task and system evidence.'},
      acl: {label:'Critical ACL tests failed',values:[0,1,0],max:2,format:'integer',direction:'Zero required to proceed',note:'One critical permission failure stops rollout, regardless of relevance or coverage gains. Zero failed synthetic tests in v2 does not certify security; independent validation remains required.'}
    }
  }
};

function formatValue(value, format) {
  if (format === 'percent') return Math.round(value * 100) + '%';
  if (format === 'wholePercent') return value + '%';
  if (format === 'decimal') return value.toFixed(2);
  if (format === 'cost') return value.toFixed(1) + '×';
  if (format === 'ms') return value + ' ms';
  return String(value);
}

function updateExperiment(element, key) {
  const experiment = experiments[element.dataset.experiment];
  const metric = experiment?.metrics[key];
  if (!metric) return;
  element.querySelectorAll('[data-metric]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.metric === key)));
  element.querySelector('[data-chart-label]').textContent = metric.label;
  element.querySelector('[data-chart-direction]').textContent = metric.direction;
  element.querySelectorAll('[data-chart-row]').forEach((row, index) => {
    const value = metric.values[index];
    row.querySelector('[data-bar]').style.width = (value / metric.max * 100) + '%';
    row.querySelector('[data-value]').textContent = formatValue(value, metric.format);
    row.querySelector('[data-gate]').hidden = metric.gate === undefined;
    if (metric.gate !== undefined) row.querySelector('[data-gate]').style.left = (metric.gate / metric.max * 100) + '%';
  });
  element.querySelector('[data-axis-start]').textContent = formatValue(0, metric.format);
  element.querySelector('[data-axis-end]').textContent = formatValue(metric.max, metric.format);
  element.querySelector('[data-chart-insight]').textContent = metric.note;
  const summary = experiment.names.map((name, i) => name + ': ' + formatValue(metric.values[i], metric.format)).join('; ');
  element.querySelector('[data-chart-summary]').textContent = metric.label + '. ' + summary + '. ' + metric.direction + '. Simulated data.';
}

document.querySelectorAll('[data-experiment]').forEach(element => {
  element.querySelectorAll('[data-metric]').forEach(button => button.addEventListener('click', () => updateExperiment(element, button.dataset.metric)));
  updateExperiment(element, element.querySelector('[data-metric][aria-pressed="true"]').dataset.metric);
});

if ('IntersectionObserver' in window) {
  const tocLinks = [...document.querySelectorAll('.case-toc a[href^="#"]')];
  const observer = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.isIntersecting);
    if (!entry) return;
    tocLinks.forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, {rootMargin:'-10% 0px -60% 0px'});
  document.querySelectorAll('.case-section').forEach(section => observer.observe(section));
}
