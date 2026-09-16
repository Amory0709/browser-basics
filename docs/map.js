(function () {
  const MAP = { w: 960, h: 640, pad: 40 };

  const PALETTE = {
    line: '#525252',
    lineLight: '#a3a3a3',
  };

  const TYPE = {
    mainframe: { color: '#2563eb', label: 'IBM mainframe' },
    vax: { color: '#1e293b', label: 'VAX' },
    workstation: { color: '#64748b', label: 'Workstation' },
    pc: { color: '#78716c', label: 'PC / terminal' },
    next: { color: '#0f172a', label: 'NeXT' },
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
    const stage = document.querySelector('.map-stage');
    if (stage) {
      stage.innerHTML = `<p class="map-error">${message}</p>`;
      return;
    }
    const map = document.getElementById('map');
    if (map) {
      map.innerHTML =
        `<text x="${MAP.w / 2}" y="${MAP.h / 2}" text-anchor="middle" class="map-status">${message}</text>`;
    }
  }

  function clusterRadius(count) {
    return Math.min(52, 10 + Math.sqrt(count) * 4);
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

  function layoutNodes(d3, nodes, projection) {
    const siteMeta = new Map(
      sites.map((s) => {
        const [cx, cy] = projection([s.lon, s.lat]);
        const count = s.groups.reduce((n, g) => n + g.count, 0);
        return [s.id, { cx, cy, radius: clusterRadius(count) }];
      })
    );

    const grouped = d3.group(nodes, (d) => d.siteId);
    grouped.forEach((list, siteId) => {
      const { cx, cy, radius } = siteMeta.get(siteId);
      list.forEach((node, i) => {
        const angle = i * 2.399963;
        const r = radius * Math.sqrt((i + 0.5) / list.length);
        node.cx = cx;
        node.cy = cy;
        node.x = cx + Math.cos(angle) * r;
        node.y = cy + Math.sin(angle) * r;
      });
    });

    const sim = d3
      .forceSimulation(nodes)
      .force('x', d3.forceX((d) => d.cx).strength(0.2))
      .force('y', d3.forceY((d) => d.cy).strength(0.2))
      .force('collide', d3.forceCollide(3.2))
      .stop();

    for (let i = 0; i < 150; i += 1) sim.tick();
  }

  function fixRing(d3, ring, isExterior) {
    const area = d3.geoArea({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [ring] },
    });
    const coversHemisphere = area > Math.PI;
    if (isExterior && coversHemisphere) return ring.slice().reverse();
    if (!isExterior && !coversHemisphere) return ring.slice().reverse();
    return ring;
  }

  function rewindGeometry(d3, geometry) {
    if (geometry.type === 'Polygon') {
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((ring, i) => fixRing(d3, ring, i === 0)),
      };
    }
    if (geometry.type === 'MultiPolygon') {
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((poly) =>
          poly.map((ring, i) => fixRing(d3, ring, i === 0))
        ),
      };
    }
    return geometry;
  }

  function rewindFeature(d3, feature) {
    return { ...feature, geometry: rewindGeometry(d3, feature.geometry) };
  }

  function paintBoundaries(g, path, features, stroke, dash) {
    const sel = g
      .selectAll('path')
      .data(features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');
    if (dash) sel.attr('stroke-dasharray', dash);
  }

  function initMap() {
    const d3 = window.d3;
    if (!window.CERN_GEO) throw new Error('Missing geo/bundle.js');

    const svg = d3.select('#map');
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${MAP.w} ${MAP.h}`)
      .attr('fill', 'none')
      .style('border', 'none')
      .style('background', 'transparent')
      .style('outline', 'none');

    const { ch, fr } = window.CERN_GEO;
    if (!ch?.features?.length || !fr?.features?.length) {
      throw new Error('GeoJSON communes empty');
    }

    const chF = ch.features.map((f) => rewindFeature(d3, { ...f, country: 'ch' }));
    const frF = fr.features.map((f) => rewindFeature(d3, { ...f, country: 'fr' }));
    const fit = {
      type: 'FeatureCollection',
      features: [...frF, ...chF],
    };

    const projection = d3.geoMercator().fitExtent(
      [[MAP.pad, MAP.pad], [MAP.w - MAP.pad, MAP.h - MAP.pad]],
      fit
    );
    const path = d3.geoPath(projection);

    const gBase = svg.append('g').attr('class', 'basemap');
    paintBoundaries(gBase.append('g'), path, frF, PALETTE.line);
    paintBoundaries(gBase.append('g'), path, chF, PALETTE.line);

    gBase
      .append('text')
      .attr('x', projection([6.06, 46.26])[0])
      .attr('y', projection([6.06, 46.26])[1])
      .attr('class', 'region-tag')
      .attr('text-anchor', 'middle')
      .text('Switzerland');

    gBase
      .append('text')
      .attr('x', projection([6.04, 46.28])[0])
      .attr('y', projection([6.04, 46.28])[1])
      .attr('class', 'region-tag')
      .attr('text-anchor', 'middle')
      .text('France');

    const nodes = expandComputers();
    layoutNodes(d3, nodes, projection);

    const gNodes = svg.append('g').attr('class', 'nodes');
    const dots = gNodes
      .selectAll('circle.machine')
      .data(nodes, (d) => d.id)
      .join('circle')
      .attr('class', 'machine')
      .attr('r', 2.2)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => (TYPE[d.type] || TYPE.pc).color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.35);

    const gSites = svg.append('g').attr('class', 'site-markers');
    gSites
      .selectAll('g.site')
      .data(sites)
      .join('g')
      .attr('class', 'site')
      .attr('transform', (d) => {
        const [x, y] = projection([d.lon, d.lat]);
        return `translate(${x},${y})`;
      })
      .each(function (d) {
        const g = d3.select(this);
        const total = d.groups.reduce((s, gr) => s + gr.count, 0);
        g.append('circle').attr('r', 5).attr('fill', 'none').attr('stroke', '#0014dc').attr('stroke-width', 1.2);
        g.append('text')
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .attr('class', 'site-name')
          .text(d.name.split(' · ')[0]);
        g.append('text')
          .attr('y', 16)
          .attr('text-anchor', 'middle')
          .attr('class', 'site-count')
          .text(`${total}`);
      });

    const detail = d3.select('#detail');
    d3.select('#stat-total').text(`${nodes.length} machines · ${sites.length} sites`);

    function showDetail(d) {
      const t = TYPE[d.type] || TYPE.pc;
      detail.html(
        `<p class="fn-kicker">${d.site}</p>` +
        `<h3>${d.label}</h3>` +
        `<p class="fn-meta">${t.label} · ${d.region}</p>` +
        `<p class="fn-body">${d.detail}</p>`
      );
    }

    dots
      .attr('tabindex', 0)
      .on('mouseenter focus', function (_, d) {
        d3.selectAll('.machine').attr('opacity', 0.35);
        d3.select(this).attr('opacity', 1).attr('r', 4);
        showDetail(d);
      })
      .on('mouseleave blur', function () {
        d3.selectAll('.machine').attr('opacity', 0.75).attr('r', 2.2);
      });

    dots.attr('opacity', 0.75);
  }

  function boot(n) {
    if (typeof window.d3 === 'undefined' || !window.CERN_GEO) {
      if (n > 200) {
        showMapError('Failed to load d3 or geo/bundle.js');
        return;
      }
      setTimeout(() => boot(n + 1), 30);
      return;
    }
    try {
      initMap();
    } catch (e) {
      showMapError(e.message);
    }
  }

  boot(0);
})();
