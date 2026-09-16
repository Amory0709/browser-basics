(function () {
  const MAP = { w: 960, h: 640, pad: 32 };
  const COLLIDE = 5.5;
  const COLORS = {
    lakeFill: '#d9d9d9',
    lakeStroke: '#737373',
    chFill: '#ebe8e3',
    frFill: '#dedad4',
    border: '#44403c',
  };

  const TYPE = {
    mainframe: { stroke: '#1d4ed8', fill: '#dbeafe', label: 'IBM mainframe' },
    vax: { stroke: '#0f172a', fill: '#e2e8f0', label: 'VAX' },
    workstation: { stroke: '#475569', fill: '#f1f5f9', label: 'Workstation' },
    pc: { stroke: '#64748b', fill: '#f8fafc', label: 'PC / terminal' },
    next: { stroke: '#0f172a', fill: '#cbd5e1', label: 'NeXT' },
  };

  const sites = [
    {
      id: 'b513',
      name: 'Building 513 · Computer Centre',
      region: 'Meyrin · Switzerland',
      lon: 6.05351,
      lat: 46.23377,
      groups: [
        { type: 'mainframe', count: 20, label: 'IBM VM/CMS', detail: '~20 CU; ~60 GB user disk [1]' },
        { type: 'vax', count: 2, label: 'VXCRNA + VXCRNB', detail: '8650 + 8800; ~4.5 CU [1]' },
        { type: 'pc', count: 136, label: 'Index terminal lines', detail: '72 + 64 Index lines [1]' },
      ],
    },
    {
      id: 'b31',
      name: 'Building 31',
      region: 'Meyrin · Tim Berners-Lee',
      lon: 6.0568,
      lat: 46.2317,
      groups: [{ type: 'next', count: 1, label: 'NeXT', detail: '1989 proposal; WWW in 1990 [2]' }],
    },
    {
      id: 'scr',
      name: 'Meyrin SCR',
      region: 'Safety / technical control',
      lon: 6.0518,
      lat: 46.2352,
      groups: [{ type: 'pc', count: 50, label: 'LEP alarm system', detail: '50+ computers [5]' }],
    },
    {
      id: 'pcr',
      name: 'Prévessin PCR',
      region: 'France · control room',
      lon: 6.0120,
      lat: 46.2720,
      groups: [
        { type: 'workstation', count: 12, label: 'Apollo workstations', detail: 'LEP/SPS consoles [4]' },
        { type: 'pc', count: 56, label: '386 front-end PCs', detail: 'First LEP beam, Jul 1989 [4][6]' },
      ],
    },
    {
      id: 'p1',
      name: 'LEP Point 1',
      region: 'Ring · Meyrin',
      lon: 6.0582,
      lat: 46.2361,
      groups: [{ type: 'workstation', count: 30, label: 'ALEPH cluster', detail: 'Data reconstruction [3]' }],
    },
    {
      id: 'p2',
      name: 'LEP Point 2 · Sergy',
      region: 'Ring · France',
      lon: 6.0407,
      lat: 46.2503,
      groups: [{ type: 'pc', count: 25, label: 'DELPHI / L3 area', detail: 'Token Ring [4]' }],
    },
    {
      id: 'inst',
      name: 'European institutes',
      region: 'FATMEN distributed',
      lon: 6.1437,
      lat: 46.2044,
      groups: [{ type: 'vax', count: 80, label: 'Collaboration nodes', detail: '10+ OS variants [3]' }],
    },
  ];

  function showMapError(message) {
    const map = document.getElementById('map');
    if (!map) return;
    map.innerHTML =
      `<text x="${MAP.w / 2}" y="${MAP.h / 2}" text-anchor="middle" class="map-status">${message}</text>`;
  }

  function clusterRadius(count) {
    return Math.min(110, 14 + Math.sqrt(count) * 7.5);
  }

  function pixelSpiral(i, n, spread) {
    if (n <= 1) return { x: 0, y: 0 };
    const angle = i * 2.399963;
    const r = spread * Math.sqrt((i + 0.5) / n);
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  }

  function expandComputers() {
    const nodes = [];
    sites.forEach((site) => {
      site.groups.forEach((group) => {
        for (let i = 0; i < group.count; i += 1) {
          nodes.push({
            id: `${site.id}-${group.type}-${i}`,
            type: group.type,
            label: group.label,
            detail: group.detail,
            site: site.name,
            region: site.region,
            siteId: site.id,
            siteLon: site.lon,
            siteLat: site.lat,
          });
        }
      });
    });
    return nodes;
  }

  function layoutAtSites(d3, nodes, projection) {
    const siteMeta = new Map(
      sites.map((s) => {
        const [cx, cy] = projection([s.lon, s.lat]);
        const count = s.groups.reduce((n, g) => n + g.count, 0);
        return [s.id, { cx, cy, count, radius: clusterRadius(count) }];
      })
    );

    const grouped = d3.group(nodes, (d) => d.siteId);
    grouped.forEach((list, siteId) => {
      const meta = siteMeta.get(siteId);
      list.forEach((node, i) => {
        node.cx = meta.cx;
        node.cy = meta.cy;
        node.clusterR = meta.radius;
        const off = pixelSpiral(i, list.length, meta.radius);
        node.x = meta.cx + off.x;
        node.y = meta.cy + off.y;
      });
    });

    const sim = d3
      .forceSimulation(nodes)
      .force('x', d3.forceX((d) => d.cx).strength(0.08))
      .force('y', d3.forceY((d) => d.cy).strength(0.08))
      .force('collide', d3.forceCollide(COLLIDE))
      .force(
        'radial',
        d3.forceRadial((d) => d.clusterR, (d) => d.cx, (d) => d.cy).strength(0.35)
      )
      .stop();

    for (let t = 0; t < 180; t += 1) sim.tick();
  }

  function drawComputer(g, type) {
    const palette = TYPE[type] || TYPE.pc;
    g.append('rect')
      .attr('class', 'computer-screen')
      .attr('x', -4.5)
      .attr('y', -4)
      .attr('width', 9)
      .attr('height', 6.5)
      .attr('rx', 1.2)
      .attr('fill', '#fff')
      .attr('stroke', palette.stroke)
      .attr('stroke-width', 1);
    g.append('rect')
      .attr('x', -3.2)
      .attr('y', -2.8)
      .attr('width', 6.4)
      .attr('height', 4.5)
      .attr('rx', 0.6)
      .attr('fill', palette.fill);
    g.append('rect')
      .attr('x', -1)
      .attr('y', 2.6)
      .attr('width', 2)
      .attr('height', 1.6)
      .attr('fill', palette.stroke);
    g.append('rect')
      .attr('x', -2.8)
      .attr('y', 4)
      .attr('width', 5.6)
      .attr('height', 0.9)
      .attr('rx', 0.4)
      .attr('fill', palette.stroke);
  }

  function drawBoundaries(gRoot, path, lakeFeatures, landFeatures) {
    gRoot
      .append('g')
      .selectAll('path.lake')
      .data(lakeFeatures)
      .join('path')
      .attr('class', 'lake')
      .attr('d', path)
      .attr('fill', COLORS.lakeFill)
      .attr('stroke', COLORS.lakeStroke)
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round');

    gRoot
      .append('g')
      .selectAll('path.commune')
      .data(landFeatures)
      .join('path')
      .attr('class', (d) => `commune ${d.country}`)
      .attr('d', path)
      .attr('fill', (d) => (d.country === 'ch' ? COLORS.chFill : COLORS.frFill))
      .attr('stroke', 'none');

    const outlines = [...landFeatures, ...lakeFeatures];
    gRoot
      .append('g')
      .attr('class', 'geo-outlines')
      .attr('pointer-events', 'none')
      .selectAll('path.outline')
      .data(outlines)
      .join('path')
      .attr('class', 'outline')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', COLORS.border)
      .attr('stroke-width', 1.1)
      .attr('stroke-linejoin', 'round');
  }

  function drawOutlinesOnly(gRoot, path, outlineFeatures) {
    gRoot
      .selectAll('path.outline')
      .data(outlineFeatures)
      .join('path')
      .attr('class', 'outline')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', COLORS.border)
      .attr('stroke-width', 1.15)
      .attr('stroke-linejoin', 'round');
  }

  function initMap() {
    const d3 = window.d3;
    const svg = d3.select('#map');
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${MAP.w} ${MAP.h}`);

    if (!window.CERN_GEO) throw new Error('geo/bundle.js failed to load');

    const { ch, fr, lake } = window.CERN_GEO;
    const chFeatures = ch.features.map((f) => ({ ...f, country: 'ch' }));
    const frFeatures = fr.features.map((f) => ({ ...f, country: 'fr' }));
    const landFeatures = [...frFeatures, ...chFeatures];
    const fitGeo = {
      type: 'FeatureCollection',
      features: [...landFeatures, ...lake.features],
    };

    const projection = d3.geoMercator().fitExtent(
      [[MAP.pad, MAP.pad], [MAP.w - MAP.pad, MAP.h - MAP.pad]],
      fitGeo
    );
    const path = d3.geoPath(projection);

    const gMap = svg.append('g').attr('class', 'map-layer');
    drawBoundaries(gMap, path, lake.features, landFeatures);

    const gNodes = svg.append('g').attr('class', 'node-layer');
    const gLabels = svg.append('g').attr('class', 'label-layer');

    const nodes = expandComputers();
    layoutAtSites(d3, nodes, projection);

    const nodeSel = gNodes
      .selectAll('g.computer-node')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('class', 'computer-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeSel.each(function (d) {
      drawComputer(d3.select(this), d.type);
    });

    // Outlines on top so communes stay visible under dense clusters
    const gBorderTop = svg.append('g').attr('class', 'border-top').attr('pointer-events', 'none');
    drawOutlinesOnly(gBorderTop, path, [...landFeatures, ...lake.features]);

    const detail = d3.select('#detail');
    const statTotal = d3.select('#stat-total');

    function showDetail(d) {
      const t = TYPE[d.type] || TYPE.pc;
      detail.html(
        `<p class="fn-kicker">${d.site}</p>` +
        `<h3>${d.label}</h3>` +
        `<p class="fn-meta">${t.label} · ${d.region}</p>` +
        `<p class="fn-body">${d.detail}</p>` +
        `<p class="fn-coord">Site ${d.siteLat.toFixed(5)}°N, ${d.siteLon.toFixed(5)}°E</p>`
      );
    }

    statTotal.text(`${nodes.length} machines · 7 sites`);

    nodeSel
      .on('mouseenter', function (_, d) {
        d3.selectAll('.computer-node').classed('is-active', false);
        d3.select(this).classed('is-active', true).attr('transform', `translate(${d.x},${d.y}) scale(1.15)`);
        showDetail(d);
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).classed('is-active', false).attr('transform', `translate(${d.x},${d.y})`);
      })
      .on('focus', function (_, d) {
        d3.selectAll('.computer-node').classed('is-active', false);
        d3.select(this).classed('is-active', true).attr('transform', `translate(${d.x},${d.y}) scale(1.15)`);
        showDetail(d);
      })
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (d) => `${d.label}, ${d.site}`);

    gLabels
      .selectAll('g.site-label')
      .data(sites)
      .join('g')
      .attr('class', 'site-label')
      .attr('transform', (d) => {
        const [x, y] = projection([d.lon, d.lat]);
        return `translate(${x},${y - 20})`;
      })
      .each(function (d) {
        d3.select(this)
          .append('text')
          .attr('class', 'site-name')
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .text(d.name.split(' · ')[0]);
      });
  }

  function boot(attempts) {
    if (typeof window.d3 === 'undefined' || !window.CERN_GEO) {
      if (attempts > 240) {
        showMapError('Scripts not ready');
        return;
      }
      setTimeout(() => boot(attempts + 1), 25);
      return;
    }
    try {
      initMap();
    } catch (err) {
      showMapError(`Map failed: ${err.message}`);
    }
  }

  boot(0);
})();
