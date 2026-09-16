(function () {
  const MAP = { w: 960, h: 640, pad: 36 };
  const NODE_R = 7;

  const TYPE = {
    mainframe: { stroke: '#1d4ed8', fill: '#dbeafe', label: 'IBM 主机' },
    vax: { stroke: '#0f172a', fill: '#e2e8f0', label: 'VAX' },
    workstation: { stroke: '#475569', fill: '#f1f5f9', label: '工作站' },
    pc: { stroke: '#64748b', fill: '#f8fafc', label: 'PC / 终端' },
    next: { stroke: '#0f172a', fill: '#cbd5e1', label: 'NeXT' },
  };

  const sites = [
    {
      id: 'b513',
      name: 'Building 513 · Computer Centre',
      region: 'Meyrin · 瑞士侧',
      lon: 6.05351,
      lat: 46.23377,
      groups: [
        { type: 'mainframe', count: 20, label: 'IBM VM/CMS', detail: '~20 CU；~60 GB 用户盘 [1]' },
        { type: 'vax', count: 2, label: 'VXCRNA + VXCRNB', detail: '8650 + 8800；~4.5 CU [1]' },
        { type: 'pc', count: 136, label: 'Index 终端线', detail: '72+64 条 Index 线 [1]' },
      ],
    },
    {
      id: 'b31',
      name: 'Building 31',
      region: 'Meyrin · Tim BL',
      lon: 6.0568,
      lat: 46.2317,
      groups: [{ type: 'next', count: 1, label: 'NeXT', detail: '1989 提案；1990 WWW [2]' }],
    },
    {
      id: 'scr',
      name: 'Meyrin SCR',
      region: '技术/安全控制',
      lon: 6.0518,
      lat: 46.2352,
      groups: [{ type: 'pc', count: 50, label: 'LEP 报警系统', detail: '50+ 计算机 [5]' }],
    },
    {
      id: 'pcr',
      name: 'Prévessin PCR',
      region: '法国侧 · 控制室',
      lon: 6.0120,
      lat: 46.2720,
      groups: [
        { type: 'workstation', count: 12, label: 'Apollo 工作站', detail: 'LEP/SPS 控制台 [4]' },
        { type: 'pc', count: 56, label: '386 前端 PC', detail: '1989.7 首束流 [4][6]' },
      ],
    },
    {
      id: 'p1',
      name: 'LEP Point 1',
      region: '环上 · Meyrin',
      lon: 6.0582,
      lat: 46.2361,
      groups: [{ type: 'workstation', count: 30, label: 'ALEPH 等实验集群', detail: '数据重建 [3]' }],
    },
    {
      id: 'p2',
      name: 'LEP Point 2 · Sergy',
      region: '环上 · 法国',
      lon: 6.0407,
      lat: 46.2503,
      groups: [{ type: 'pc', count: 25, label: 'DELPHI / L3 区域', detail: 'Token Ring [4]' }],
    },
    {
      id: 'inst',
      name: '欧洲 institute',
      region: 'FATMEN 分布式',
      lon: 6.1437,
      lat: 46.2044,
      groups: [{ type: 'vax', count: 80, label: '跨所协作节点', detail: '10+ OS 变种 [3]' }],
    },
  ];

  const siteLinks = [
    ['b513', 'b31'],
    ['b513', 'scr'],
    ['b513', 'pcr'],
    ['pcr', 'p1'],
    ['pcr', 'p2'],
    ['b513', 'inst'],
  ];

  function showMapError(message) {
    const map = document.getElementById('map');
    if (!map) return;
    map.innerHTML =
      `<text x="${MAP.w / 2}" y="${MAP.h / 2}" text-anchor="middle" class="map-status">${message}</text>`;
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
            lon: site.lon,
            lat: site.lat,
          });
        }
      });
    });
    return nodes;
  }

  function spiralOffset(i, n, spread) {
    if (n <= 1) return { x: 0, y: 0 };
    const angle = i * 2.399963;
    const radius = spread * Math.sqrt(i + 1) / Math.sqrt(n);
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }

  function drawComputer(g, type) {
    const palette = TYPE[type] || TYPE.pc;
    g.append('rect')
      .attr('class', 'computer-screen')
      .attr('x', -5.5)
      .attr('y', -5)
      .attr('width', 11)
      .attr('height', 8)
      .attr('rx', 1.5)
      .attr('fill', '#fff')
      .attr('stroke', palette.stroke)
      .attr('stroke-width', 1.1);
    g.append('rect')
      .attr('x', -4)
      .attr('y', -3.5)
      .attr('width', 8)
      .attr('height', 5.5)
      .attr('rx', 0.8)
      .attr('fill', palette.fill);
    g.append('rect')
      .attr('x', -1.2)
      .attr('y', 3.2)
      .attr('width', 2.4)
      .attr('height', 2.2)
      .attr('fill', palette.stroke);
    g.append('rect')
      .attr('x', -3.5)
      .attr('y', 5.2)
      .attr('width', 7)
      .attr('height', 1.2)
      .attr('rx', 0.6)
      .attr('fill', palette.stroke);
  }

  function initMap() {
    const d3 = window.d3;
    const svg = d3.select('#map');
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${MAP.w} ${MAP.h}`);

    if (!window.CERN_GEO) throw new Error('geo/bundle.js 未加载');

    const { ch, fr, lake } = window.CERN_GEO;
    const allFeatures = [
      ...ch.features.map((f) => ({ ...f, country: 'ch' })),
      ...fr.features.map((f) => ({ ...f, country: 'fr' })),
    ];
    const geo = { type: 'FeatureCollection', features: allFeatures };

    const projection = d3.geoMercator().fitExtent(
      [[MAP.pad, MAP.pad], [MAP.w - MAP.pad, MAP.h - MAP.pad]],
      geo
    );
    const path = d3.geoPath(projection);

    const gMap = svg.append('g').attr('class', 'map-layer');
    const gLinks = svg.append('g').attr('class', 'link-layer');
    const gNodes = svg.append('g').attr('class', 'node-layer');
    const gLabels = svg.append('g').attr('class', 'label-layer');

    gMap.selectAll('path.commune')
      .data(allFeatures)
      .join('path')
      .attr('class', (d) => `commune ${d.country}`)
      .attr('d', path);

    gMap.selectAll('path.lake')
      .data(lake.features)
      .join('path')
      .attr('class', 'lake')
      .attr('d', path);

    const siteAnchors = new Map(
      sites.map((site) => {
        const [x, y] = projection([site.lon, site.lat]);
        return [site.id, { ...site, x, y }];
      })
    );

    const nodes = expandComputers();
    const grouped = d3.group(nodes, (d) => d.siteId);
    grouped.forEach((list, siteId) => {
      const anchor = siteAnchors.get(siteId);
      const spread = Math.min(42, 8 + Math.sqrt(list.length) * 3.2);
      list.forEach((node, i) => {
        const off = spiralOffset(i, list.length, spread);
        node.ax = anchor.x + off.x;
        node.ay = anchor.y + off.y;
        node.x = node.ax;
        node.y = node.ay;
      });
    });

    const links = siteLinks
      .map(([a, b]) => {
        const sa = siteAnchors.get(a);
        const sb = siteAnchors.get(b);
        if (!sa || !sb) return null;
        return { source: sa, target: sb };
      })
      .filter(Boolean);

    gLinks
      .selectAll('line.site-link')
      .data(links)
      .join('line')
      .attr('class', 'site-link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    const nodeSel = gNodes
      .selectAll('g.computer-node')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('class', 'computer-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeSel.each(function (d) {
      drawComputer(d3.select(this), d.type);
    });

    const detail = d3.select('#detail');
    const statTotal = d3.select('#stat-total');

    function showDetail(d) {
      const t = TYPE[d.type] || TYPE.pc;
      detail.html(
        `<p class="fn-kicker">${d.site}</p>` +
        `<h3>${d.label}</h3>` +
        `<p class="fn-meta">${t.label} · ${d.region}</p>` +
        `<p class="fn-body">${d.detail}</p>`
      );
    }

    statTotal.text(`${nodes.length} 台 / 节点`);

    nodeSel
      .on('mouseenter', function (_, d) {
        d3.selectAll('.computer-node').classed('is-active', false);
        const g = d3.select(this).classed('is-active', true);
        g.attr('transform', `translate(${d.x},${d.y}) scale(1.12)`);
        showDetail(d);
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).classed('is-active', false);
        d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
      })
      .on('focus', function (_, d) {
        d3.selectAll('.computer-node').classed('is-active', false);
        d3.select(this).classed('is-active', true).attr('transform', `translate(${d.x},${d.y}) scale(1.12)`);
        showDetail(d);
      })
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (d) => `${d.label}，${d.site}`);

    gLabels
      .selectAll('g.site-label')
      .data([...siteAnchors.values()])
      .join('g')
      .attr('class', 'site-label')
      .attr('transform', (d) => `translate(${d.x},${d.y - 52})`)
      .each(function (d) {
        const g = d3.select(this);
        g.append('text').attr('class', 'site-name').attr('y', 0).text(d.name.split(' · ')[0]);
        g.append('text')
          .attr('class', 'site-count')
          .attr('y', 14)
          .text(`${d.groups.reduce((s, gr) => s + gr.count, 0)} 台`);
      });

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'x',
        d3
          .forceX((d) => d.ax)
          .strength(0.12)
      )
      .force(
        'y',
        d3
          .forceY((d) => d.ay)
          .strength(0.12)
      )
      .force('collide', d3.forceCollide(NODE_R + 1.2))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
  }

  function boot(attempts) {
    if (typeof window.d3 === 'undefined' || !window.CERN_GEO) {
      if (attempts > 240) {
        showMapError('依赖脚本未就绪');
        return;
      }
      setTimeout(() => boot(attempts + 1), 25);
      return;
    }
    try {
      initMap();
    } catch (err) {
      showMapError(`地图加载失败：${err.message}`);
    }
  }

  boot(0);
})();
