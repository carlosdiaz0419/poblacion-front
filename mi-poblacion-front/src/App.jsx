import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const baseUrl = 'https://backend-production-1a3af.up.railway.app';

const PALETTE = {
  wine:      '#741b2a',
  wineDeep:  '#4f0f1c',
  wineLight: '#a62a40',
  gold:      '#c9a15a',
  goldSoft:  '#e4c98a',
  danger:    '#d64545',
  success:   '#2e7d32',
};

const MAX_ANIOS_TENDENCIA = 20;

const formatCompacto = (valor) => {
  const v = Number(valor) || 0;
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}K`;
  return `${v}`;
};

const getStyles = (isDarkMode) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDarkMode
      ? 'radial-gradient(circle at 20% 20%, #1b1620 0%, #0f0d12 55%, #0a090c 100%)'
      : 'radial-gradient(circle at 20% 20%, #ffffff 100%, #ffffff 100%, #ffffff 100%)',
    fontFamily: '"Montserrat", sans-serif',
    padding: '20px',
    position: 'relative',
    transition: 'background 0.4s ease',
    overflow: 'hidden',
  },
  logo: { position: 'absolute', top: '20px', left: '20px', width: '200px', height: 'auto', zIndex: 10 },
  themeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px',
    borderRadius: '50%',
    border: isDarkMode ? `1px solid ${PALETTE.gold}55` : `1px solid ${PALETTE.wine}33`,
    cursor: 'pointer',
    background: isDarkMode ? '#26202c' : '#ffffff',
    fontSize: '20px',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  card: {
    backgroundColor: isDarkMode ? '#1c1720' : '#ffffff',
    padding: '40px',
    borderRadius: '28px',
    border: isDarkMode ? '1px solid #33283a' : `1px solid ${PALETTE.wine}14`,
    boxShadow: isDarkMode
      ? '0 25px 60px rgba(0,0,0,0.55), 0 0 40px rgba(201,161,90,0.06)'
      : '0 25px 60px rgba(116,27,42,0.12), 0 2px 8px rgba(116,27,42,0.06)',
    width: '95%',
    maxWidth: '650px',
    textAlign: 'center',
    animation: 'fadeInUp 0.8s ease-out',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    color: isDarkMode ? PALETTE.goldSoft : PALETTE.wine,
    fontSize: '24px',
    marginBottom: '25px',
    fontWeight: '800',
    letterSpacing: '0.3px',
  },
  label: {
    color: isDarkMode ? '#cbb9d6' : '#6b3540',
    fontWeight: '800',
    fontSize: '11px',
    marginBottom: '7px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '15px',
    borderRadius: '15px',
    border: isDarkMode ? `1.5px solid ${PALETTE.gold}33` : `1.5px solid ${PALETTE.wine}2a`,
    fontSize: '15px',
    boxSizing: 'border-box',
    textAlign: 'center',
    backgroundColor: isDarkMode ? '#252030' : '#fffdfb',
    backgroundImage: isDarkMode
      ? `linear-gradient(160deg, #27212f 0%, #201a27 100%)`
      : `linear-gradient(160deg, #ffffff 0%, #fdf7f2 100%)`,
    color: isDarkMode ? '#fff' : '#000',
    boxShadow: isDarkMode
      ? `0 4px 16px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(201,161,90,0.05)`
      : `0 4px 16px rgba(116,27,42,0.08), inset 0 0 0 1px rgba(116,27,42,0.03)`,
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease',
    outline: 'none',
  },
  button: (isCargando, isDarkMode) => ({
    width: '100%',
    padding: '14px',
    backgroundImage: isDarkMode
      ? `linear-gradient(135deg, ${PALETTE.wineLight}, ${PALETTE.wineDeep})`
      : `linear-gradient(135deg, ${PALETTE.wine}, ${PALETTE.wineDeep})`,
    color: '#ffffff',
    border: 'none',
    borderRadius: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isCargando ? 'not-allowed' : 'pointer',
    marginTop: '10px',
    opacity: isCargando ? 0.7 : 1,
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease',
    boxShadow: isDarkMode
      ? '0 6px 20px rgba(166,42,64,0.35)'
      : '0 6px 20px rgba(116,27,42,0.28)',
  }),
  resultadoCard: {
    padding: '15px',
    backgroundColor: isDarkMode ? '#26202f' : '#fdf2f4',
    borderRadius: '15px',
    border: isDarkMode ? `1px solid ${PALETTE.gold}44` : `1px solid ${PALETTE.wine}55`,
    marginTop: '10px',
    color: isDarkMode ? '#fff' : '#000',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  },
  navButton: {
    marginBottom: '20px',
    background: 'none',
    border: isDarkMode ? `1px solid ${PALETTE.goldSoft}` : `1px solid ${PALETTE.wine}`,
    color: isDarkMode ? PALETTE.goldSoft : PALETTE.wine,
    borderRadius: '10px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all 0.3s',
  },
  graficaButton: {
    marginTop: '15px',
    padding: '12px 20px',
    backgroundColor: isDarkMode ? '#3a2f45' : '#e6b459',
    color: '#ffffff',
    border: isDarkMode ? `1px solid ${PALETTE.gold}33` : `1px solid ${PALETTE.wine}22`,
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s',
  },
  exportButton: {
    marginTop: '15px',
    padding: '12px 20px',
    backgroundImage: isDarkMode
      ? `linear-gradient(135deg, ${PALETTE.wineDeep}, #241f2b)`
      : 'linear-gradient(135deg, #333, #111)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s',
  },
  swapButton: {
    alignSelf: 'center',
    marginTop: '22px',
    width: '38px',
    height: '38px',
    minWidth: '38px',
    borderRadius: '50%',
    border: isDarkMode ? `1px solid ${PALETTE.gold}55` : `1px solid ${PALETTE.wine}33`,
    background: isDarkMode ? '#26202c' : '#ffffff',
    color: isDarkMode ? PALETTE.goldSoft : PALETTE.wine,
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  exportButtonPdf: {
    marginTop: '10px',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: isDarkMode ? PALETTE.goldSoft : PALETTE.wine,
    border: isDarkMode ? `1.5px solid ${PALETTE.gold}66` : `1.5px solid ${PALETTE.wine}55`,
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s',
  },
  narrativeBox: {
    marginTop: '16px',
    padding: '15px',
    border: `1px dashed ${PALETTE.gold}`,
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'justify',
    backgroundColor: isDarkMode ? '#221d29' : '#fbf3e8',
  },
  proCard: {
    marginTop: '16px',
    padding: '18px',
    borderRadius: '18px',
    backgroundColor: isDarkMode ? '#221d29' : '#fdfaf6',
    border: isDarkMode ? '1px solid #3c3245' : `1px solid ${PALETTE.wine}18`,
    boxShadow: isDarkMode ? '0 10px 26px rgba(0,0,0,0.35)' : '0 10px 26px rgba(116,27,42,0.08)',
  },
  legendChip: (color, isDarkMode) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: '700',
    backgroundColor: `${color}1f`,
    color: isDarkMode ? '#fff' : color,
    border: `1px solid ${color}55`,
  }),
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const styles = getStyles(isDarkMode);
  const [vista, setVista] = useState('consulta');
  const [cargando, setCargando] = useState(false);
  const [mostrarGrafica, setMostrarGrafica] = useState(false);
  const capturaRef = useRef(null);

  // NUEVO ESTADO PARA ALTERNAR GRÁFICA DE PERFIL (PIRÁMIDE VS PASTEL)
  const [vistaPerfil, setVistaPerfil] = useState('piramide');

  const [municipio, setMunicipio] = useState('Tuxtla Gutiérrez');
  
  // Estados para comparación A
  const [estadoA, setEstadoA] = useState('');
  const [municipiosListaA, setMunicipiosListaA] = useState([]);
  const [munA, setMunA] = useState('');

  // Estados para comparación B
  const [estadoB, setEstadoB] = useState('');
  const [municipiosListaB, setMunicipiosListaB] = useState([]);
  const [munB, setMunB] = useState('');

  const [nombresCongelados, setNombresCongelados] = useState({ a: 'Tuxtla Gutiérrez', b: 'Ocosingo' });
  const [ano, setAno] = useState(2026);
  const [sexo, setSexo] = useState('AMBOS');
  const [resultado, setResultado] = useState(null);
  const [resultados, setResultados] = useState({ a: null, b: null });
  const [rangoInicio, setRangoInicio] = useState(2026);
  const [rangoFin, setRangoFin] = useState(2030);
  const [datosPiramide, setDatosPiramide] = useState(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [rangoInicioTendencia, setRangoInicioTendencia] = useState(2026);
  const [rangoFinTendencia, setRangoFinTendencia] = useState(2030);
  const [datosTendencia, setDatosTendencia] = useState(null);
  const [mostrarTendencia, setMostrarTendencia] = useState(false);
  const [cargandoTendencia, setCargandoTendencia] = useState(false);
  const [toast, setToast] = useState(null);
  const [mostrarTendenciaComp, setMostrarTendenciaComp] = useState(false);
  const [rangoInicioComp, setRangoInicioComp] = useState(2026);
  const [rangoFinComp, setRangoFinComp] = useState(2030);
  const [datosTendenciaComp, setDatosTendenciaComp] = useState(null);
  const [nombresTendenciaComp, setNombresTendenciaComp] = useState({ a: '', b: '' });
  const [cargandoTendenciaComp, setCargandoTendenciaComp] = useState(false);
  const [distribucionEdadComp, setDistribucionEdadComp] = useState({ a: null, b: null });
  const [narrativaEdadMedia, setNarrativaEdadMedia] = useState(""); 
  const [cargandoDistribucion, setCargandoDistribucion] = useState(false);
  
  // Estados para el catálogo de municipios agrupados por estado
  const [estadosData, setEstadosData] = useState({});
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [municipiosLista, setMunicipiosLista] = useState([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);

  // Cargar catálogo de estados y municipios al iniciar la aplicación
  useEffect(() => {
    fetch(`${baseUrl}/api/municipios`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        return res.json();
      })
      .then((data) => {
        setEstadosData(data);
        setCargandoUbicaciones(false);
      })
      .catch((err) => {
        console.error(err);
        mostrarToast('No se pudieron cargar las ubicaciones');
        setCargandoUbicaciones(false);
      });
  }, []);

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setEstadoSeleccionado(estado);
    setMunicipiosLista(estadosData[estado] || []);
    setMunicipio(''); // Limpiar municipio al cambiar de estado
  };

  const handleEstadoAChange = (e) => {
    const estado = e.target.value;
    setEstadoA(estado);
    setMunicipiosListaA(estadosData[estado] || []);
    setMunA('');
  };

  const handleEstadoBChange = (e) => {
    const estado = e.target.value;
    setEstadoB(estado);
    setMunicipiosListaB(estadosData[estado] || []);
    setMunB('');
  };

  const generarAnalisisNarrativo = (datos) => {
    if (!datos || datos.length === 0) return "";
    const maxGrupo = datos.reduce((prev, current) =>
      (Math.abs(current.hombres) + Math.abs(current.mujeres)) >
      (Math.abs(prev.hombres) + Math.abs(prev.mujeres)) ? current : prev
    );
    return `El perfil demográfico muestra una concentración poblacional predominante en el rango de edad ${maxGrupo.edad}. 
    Se observa una tendencia de distribución que requiere atención en políticas públicas de desarrollo social y económico para los próximos años.`;
  };

  const generarAnalisisTendencia = (datos, nombreMunicipio) => {
    if (!datos || datos.length < 2) return '';
    const inicio = datos[0];
    const fin = datos[datos.length - 1];
    const diferencia = fin.poblacion - inicio.poblacion;
    const porcentaje = inicio.poblacion ? ((diferencia / inicio.poblacion) * 100).toFixed(1) : '0';
    const tendenciaTexto = diferencia > 0 ? 'un crecimiento' : diferencia < 0 ? 'una disminución' : 'una estabilidad';
    return `Entre ${inicio.ano} y ${fin.ano}, ${nombreMunicipio} proyecta ${tendenciaTexto} poblacional de ${Math.abs(diferencia).toLocaleString()} habitantes (${porcentaje}%), pasando de ${inicio.poblacion.toLocaleString()} a ${fin.poblacion.toLocaleString()} habitantes.`;
  };

  const generarAnalisisTendenciaComparativa = (datos, nombreA, nombreB) => {
    if (!datos || datos.length < 2) return '';
    const inicio = datos[0];
    const fin = datos[datos.length - 1];
    const crecA = fin.a - inicio.a;
    const crecB = fin.b - inicio.b;
    const pctA = inicio.a ? ((crecA / inicio.a) * 100).toFixed(1) : '0';
    const pctB = inicio.b ? ((crecB / inicio.b) * 100).toFixed(1) : '0';
    const brechaFinal = Math.abs(fin.a - fin.b);
    const ganador = fin.a === fin.b ? null : (fin.a > fin.b ? nombreA : nombreB);
    let texto = `Entre ${inicio.ano} y ${fin.ano}, ${nombreA} varía ${pctA}% y ${nombreB} varía ${pctB}%. `;
    texto += ganador
      ? `Para ${fin.ano}, ${ganador} tendría la mayor población, con una diferencia de ${brechaFinal.toLocaleString()} habitantes respecto al otro municipio.`
      : `Para ${fin.ano}, ambos municipios llegarían a una población prácticamente igual.`;
    return texto;
  };

  const validarRango = (inicio, fin) => {
    const ini = Number(inicio);
    const fn = Number(fin);
    if (Number.isNaN(ini) || Number.isNaN(fn)) return 'Los años deben ser números válidos.';
    if (fn < ini) return 'El "Periodo Fin" debe ser mayor o igual al "Periodo Inicio".';
    if (fn - ini + 1 > MAX_ANIOS_TENDENCIA) return `El rango es muy amplio. Máximo ${MAX_ANIOS_TENDENCIA} años a la vez.`;
    return null;
  };

  const mostrarToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const consultarPiramide = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${baseUrl}/api/piramide?mun=${encodeURIComponent(municipio)}&inicio=${rangoInicio}&fin=${rangoFin}`);
      const json = await res.json();
      setDatosPiramide(json.datos);
      setMostrarPerfil(true);
    } catch (err) {
      console.error("Error al obtener pirámide", err);
      mostrarToast('No se pudo generar el Perfil Demográfico.');
    }
    finally { setCargando(false); }
  };

  const alternarPerfil = () => {
    if (datosPiramide) {
      setMostrarPerfil((prev) => !prev);
    } else {
      consultarPiramide();
    }
  };

  const exportarImagen = () => {
    if (capturaRef.current) {
      html2canvas(capturaRef.current, {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        ignoreElements: (el) => el.classList && el.classList.contains('no-capturar'),
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'reporte-poblacion.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const fetchPoblacion = async (mun) => {
    const res = await fetch(`${baseUrl}/api/poblacion?municipio=${encodeURIComponent(mun)}&ano=${ano}&sexo=${sexo}`);
    if (!res.ok) throw new Error('Error en el servidor');
    return await res.json();
  };

  const consultarPoblacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const json = await fetchPoblacion(municipio);
      setResultado(json.datos?.poblacion_total || 0);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const obtenerNarrativaEdadMedia = async () => {
    setCargando(true);
    try {
      const json = await fetchPoblacion(municipio);
      const total = json.datos?.poblacion_total || 0;
      const valor = Math.round(total * 0.35); 
      setNarrativaEdadMedia(`En ${municipio}, el grupo de edad media (30-55 años) representa aproximadamente ${valor.toLocaleString()} personas, un sector clave para el análisis demográfico actual.`);
    } catch (err) {
      setNarrativaEdadMedia("No se pudo obtener la información.");
    } finally {
      setCargando(false);
    }
  };

  const compararPoblacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const [resA, resB] = await Promise.all([fetchPoblacion(munA), fetchPoblacion(munB)]);
      setResultados({ a: resA.datos?.poblacion_total || 0, b: resB.datos?.poblacion_total || 0 });
      setNombresCongelados({ a: munA, b: munB });
      setDistribucionEdadComp({ a: null, b: null });
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const intercambiarMunicipios = () => {
    const tempMunA = munA;
    setMunA(munB);
    setMunB(tempMunA);

    const tempEstadoA = estadoA;
    setEstadoA(estadoB);
    setEstadoB(tempEstadoA);

    const tempListaA = municipiosListaA;
    setMunicipiosListaA(municipiosListaB);
    setMunicipiosListaB(tempListaA);
  };

  const fetchPoblacionAnio = async (mun, anioParam) => {
    const res = await fetch(`${baseUrl}/api/poblacion?municipio=${encodeURIComponent(mun)}&ano=${anioParam}&sexo=${sexo}`);
    return await res.json();
  };

  const consultarTendencia = async () => {
    const error = validarRango(rangoInicioTendencia, rangoFinTendencia);
    if (error) { mostrarToast(error); return; }
    setCargandoTendencia(true);
    try {
      const inicio = Number(rangoInicioTendencia);
      const fin = Number(rangoFinTendencia);
      const anios = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
      const respuestas = await Promise.all(anios.map((a) => fetchPoblacionAnio(municipio, a)));
      const serie = anios.map((a, i) => ({
        ano: a,
        poblacion: respuestas[i]?.datos?.poblacion_total || 0,
      }));
      setDatosTendencia(serie);
      setMostrarTendencia(true);
    } catch (err) {
      console.error('Error al obtener la tendencia', err);
      mostrarToast('No se pudo generar la línea de tendencia.');
    } finally {
      setCargandoTendencia(false);
    }
  };

  const consultarTendenciaComparativa = async () => {
    const error = validarRango(rangoInicioComp, rangoFinComp);
    if (error) { mostrarToast(error); return; }
    setCargandoTendenciaComp(true);
    try {
      const inicio = Number(rangoInicioComp);
      const fin = Number(rangoFinComp);
      const anios = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
      const [respuestasA, respuestasB] = await Promise.all([
        Promise.all(anios.map((a) => fetchPoblacionAnio(munA, a))),
        Promise.all(anios.map((a) => fetchPoblacionAnio(munB, a))),
      ]);
      const serie = anios.map((a, i) => ({
        ano: a,
        a: respuestasA[i]?.datos?.poblacion_total || 0,
        b: respuestasB[i]?.datos?.poblacion_total || 0,
      }));
      setDatosTendenciaComp(serie);
      setNombresTendenciaComp({ a: munA, b: munB });
    } catch (err) {
      console.error('Error al obtener la tendencia comparativa', err);
      mostrarToast('No se pudo generar la comparación de tendencias.');
    } finally {
      setCargandoTendenciaComp(false);
    }
  };

  const consultarDistribucionEdad = async () => {
    setCargandoDistribucion(true);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`${baseUrl}/api/piramide?mun=${encodeURIComponent(munA)}&inicio=${ano}&fin=${ano}`).then((r) => r.json()),
        fetch(`${baseUrl}/api/piramide?mun=${encodeURIComponent(munB)}&inicio=${ano}&fin=${ano}`).then((r) => r.json()),
      ]);
      setDistribucionEdadComp({ a: resA.datos || null, b: resB.datos || null });
    } catch (err) {
      console.error('Error al obtener la distribución por edad', err);
      mostrarToast('No se pudo generar la distribución por edad.');
    } finally {
      setCargandoDistribucion(false);
    }
  };

  const alternarGraficaComparativa = () => {
    const abrir = !mostrarGrafica;
    setMostrarGrafica(abrir);
    if (abrir && !distribucionEdadComp.a && !cargandoDistribucion) {
      consultarDistribucionEdad();
    }
  };

  const exportarPDF = async () => {
    if (!capturaRef.current) return;
    try {
      const canvas = await html2canvas(capturaRef.current, {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        ignoreElements: (el) => el.classList && el.classList.contains('no-capturar'),
      });
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.setFontSize(16);
      doc.text('Reporte de Población', 40, 50);
      doc.setFontSize(10);
      doc.text(`Fecha de consulta: ${new Date().toLocaleString('es-MX')}`, 40, 68);
      doc.addImage(imgData, 'PNG', 40, 85, imgWidth, imgHeight);
      let cursorY = 85 + imgHeight + 30;
      if (datosPiramide) {
        doc.setFontSize(12);
        const texto = generarAnalisisNarrativo(datosPiramide).replace(/\s+/g, ' ').trim();
        const lineas = doc.splitTextToSize(texto, pageWidth - 80);
        doc.setFontSize(10);
        doc.text(lineas, 40, cursorY + 18);
      }
      doc.save('reporte-poblacion.pdf');
    } catch (err) {
      console.error('Error al exportar PDF', err);
      mostrarToast('No se pudo generar el PDF.');
    }
  };

  const ComparativaTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const valorActual = payload[0].value;
    const esA = label === nombresCongelados.a;
    const otroValor = esA ? resultados.b : resultados.a;
    const diferencia = valorActual - (otroValor || 0);
    const flecha = diferencia > 0 ? '▲' : diferencia < 0 ? '▼' : '■';
    const colorFlecha = diferencia > 0 ? PALETTE.success : diferencia < 0 ? PALETTE.danger : '#888';
    return (
      <div style={{
        backgroundColor: isDarkMode ? '#2d2438' : '#fff',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${PALETTE.gold}55`,
        boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
        fontSize: '13px',
        color: isDarkMode ? '#fff' : '#333',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</div>
        <div>Año: <b>{ano}</b></div>
        <div>Población: <b>{valorActual.toLocaleString()}</b></div>
        <div style={{ color: colorFlecha, fontWeight: 'bold', marginTop: '4px' }}>
          {flecha} {Math.abs(diferencia).toLocaleString()} vs {esA ? nombresCongelados.b : nombresCongelados.a}
        </div>
      </div>
    );
  };

  const TendenciaComparativaTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const valA = payload.find((p) => p.dataKey === 'a')?.value ?? 0;
    const valB = payload.find((p) => p.dataKey === 'b')?.value ?? 0;
    return (
      <div style={{
        backgroundColor: isDarkMode ? '#2d2438' : '#fff',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${PALETTE.gold}55`,
        boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
        fontSize: '13px',
        color: isDarkMode ? '#fff' : '#333',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Año {label}</div>
        <div style={{ color: PALETTE.wine }}>{nombresTendenciaComp.a}: <b>{valA.toLocaleString()}</b></div>
        <div style={{ color: PALETTE.gold, marginTop: '2px' }}>{nombresTendenciaComp.b}: <b>{valB.toLocaleString()}</b></div>
      </div>
    );
  };

  const renderDistribucionEdad = (datos, colorBase) => {
    if (!datos || datos.length === 0) return null;
    const total = datos.reduce((acc, d) => acc + Math.abs(d.hombres || 0) + Math.abs(d.mujeres || 0), 0);
    const segmentos = datos.map((d, i) => {
      const cantidad = Math.abs(d.hombres || 0) + Math.abs(d.mujeres || 0);
      const pct = total ? (cantidad / total) * 100 : 0;
      const opacidad = Math.max(0.32, 1 - i * (0.62 / Math.max(datos.length - 1, 1)));
      return { edad: d.edad, pct, opacidad };
    });
    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '30px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.35)' : '0 4px 14px rgba(116,27,42,0.14)',
        }}
      >
        {segmentos.map((s) => (
          <div
            key={s.edad}
            className="segmento-edad"
            title={`${s.edad}: ${s.pct.toFixed(1)}%`}
            style={{
              width: `${s.pct}%`,
              backgroundColor: colorBase,
              opacity: s.opacidad,
              borderRight: isDarkMode ? '1px solid rgba(0,0,0,0.3)' : '1px solid rgba(255,255,255,0.55)',
            }}
          />
        ))}
      </div>
    );
  };
  

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes viewEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .vista-transition { animation: viewEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .interactive-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.015);
          filter: brightness(1.12);
          box-shadow: 0 10px 28px rgba(116, 27, 42, 0.4), 0 0 22px rgba(201, 161, 90, 0.35);
        }
        .interactive-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }
        .interactive-input:hover {
          border-color: ${PALETTE.gold} !important;
          box-shadow: 0 0 0 3px rgba(201, 161, 90, 0.16), 0 8px 20px rgba(116, 27, 42, 0.16);
          transform: translateY(-1px);
        }
        .interactive-input:focus {
          border-color: ${PALETTE.gold} !important;
          box-shadow: 0 0 0 4px rgba(201, 161, 90, 0.22), 0 0 16px rgba(116, 27, 42, 0.18);
          transform: translateY(-1px);
        }
        select.interactive-input {
          appearance: none; -webkit-appearance: none; -moz-appearance: none;
          cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, ${PALETTE.gold} 50%), linear-gradient(135deg, ${PALETTE.gold} 50%, transparent 50%);
          background-position: calc(100% - 22px) calc(1em + 2px), calc(100% - 17px) calc(1em + 2px);
          background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 40px;
        }
        select.interactive-input::-ms-expand { display: none; }
        select.interactive-input option {
          background-color: ${isDarkMode ? '#252030' : '#fffdfb'};
          color: ${isDarkMode ? '#ffffff' : '#3a2a2f'};
        }
        .resultado-glow:hover {
          box-shadow: 0 0 0 2px rgba(201, 161, 90, 0.35), 0 8px 24px rgba(116, 27, 42, 0.18);
          transform: translateY(-2px);
        }
        .campo-glow {
          border-radius: 16px; padding: 8px 8px 0 8px; transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .campo-glow:hover {
          background: ${isDarkMode ? 'rgba(201, 161, 90, 0.06)' : 'rgba(116, 27, 42, 0.04)'};
          box-shadow: 0 8px 20px rgba(116, 27, 42, 0.10), 0 0 14px rgba(201, 161, 90, 0.16);
          transform: translateY(-2px);
        }
        .theme-toggle:hover {
          transform: rotate(15deg) scale(1.08);
          box-shadow: 0 0 18px rgba(201, 161, 90, 0.45);
        }
        .label-glow {
          position: relative;
          text-shadow: ${isDarkMode ? '0 0 12px rgba(228,201,138,0.30)' : '0 0 10px rgba(116,27,42,0.10)'};
        }
        .label-glow::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 7px;
          flex-shrink: 0;
          background: ${PALETTE.gold};
          box-shadow: 0 0 8px ${PALETTE.gold}, 0 0 2px ${PALETTE.gold};
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .btn-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        @keyframes loadingSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .progress-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          overflow: hidden;
          background: ${isDarkMode ? 'rgba(201,161,90,0.15)' : 'rgba(116,27,42,0.10)'};
          z-index: 5;
        }
        .progress-bar::after {
          content: '';
          position: absolute; top: 0; left: 0; height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, ${PALETTE.gold}, transparent);
          animation: loadingSlide 1.1s ease-in-out infinite;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 22px;
          border-radius: 12px;
          z-index: 999;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          animation: toastIn 0.3s ease-out;
          color: #fff;
        }
        .toast-error { background: ${PALETTE.danger}; }
        .toast-success { background: ${PALETTE.success}; }
        .swap-btn:hover {
          transform: rotate(180deg) scale(1.1);
          box-shadow: 0 0 16px rgba(201, 161, 90, 0.5);
        }
        @keyframes resultEnter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .result-enter { animation: resultEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
        .segmento-edad {
          position: relative;
          transition: filter 0.2s ease;
          cursor: default;
        }
        .segmento-edad:hover {
          filter: brightness(1.25);
        }
      `}</style>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      <img src="/ayuntamiento.webp" alt="Logo" style={styles.logo} />
      <button className="interactive-btn theme-toggle" style={styles.themeButton} onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      
      <div style={styles.card}>
        {(cargando || cargandoTendencia || cargandoTendenciaComp || cargandoDistribucion || cargandoUbicaciones) && <div className="progress-bar" />}
        <button
          className="interactive-btn"
          style={styles.navButton}
          onClick={() => {
            setVista(vista === 'consulta' ? 'comparar' : 'consulta');
            setMostrarGrafica(false);
            setDatosPiramide(null);
            setMostrarPerfil(false);
            setDatosTendencia(null);
            setMostrarTendencia(false);
            setDatosTendenciaComp(null);
            setMostrarTendenciaComp(false);
            setDistribucionEdadComp({ a: null, b: null });
          }}
        >
          {vista === 'consulta' ? 'Cambiar a Análisis' : 'Cambiar a Estimaciones'}
        </button>

        {/* ============================================== */}
        {/* INICIO DE LA SECCIÓN RECONSTRUIDA DE LA VISTA  */}
        {/* ============================================== */}
        {vista === 'consulta' ? (
          <div className="vista-transition" ref={capturaRef}>
            <div style={styles.title}>Estimaciones de Población</div>
            <form onSubmit={consultarPoblacion}>
              <div className="campo-glow">
                <label style={styles.label}>Estado</label>
                <select className="interactive-input" style={styles.input} value={estadoSeleccionado} onChange={handleEstadoChange}>
                  <option value="">Seleccione un estado</option>
                  {Object.keys(estadosData).map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="campo-glow">
                <label style={styles.label}>Municipio</label>
                <select className="interactive-input" style={styles.input} value={municipio} onChange={(e) => setMunicipio(e.target.value)} required>
                  <option value="">Seleccione un municipio</option>
                  {municipiosLista.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="campo-glow" style={{ flex: 1 }}>
                  <label style={styles.label}>Año</label>
                  <input type="number" className="interactive-input" style={styles.input} value={ano} onChange={(e) => setAno(e.target.value)} required />
                </div>
                <div className="campo-glow" style={{ flex: 1 }}>
                  <label style={styles.label}>Sexo</label>
                  <select className="interactive-input" style={styles.input} value={sexo} onChange={(e) => setSexo(e.target.value)}>
                    <option value="AMBOS">Ambos</option>
                    <option value="Hombres">Hombres</option>
                    <option value="Mujeres">Mujeres</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="interactive-btn" style={styles.button(cargando, isDarkMode)} disabled={cargando || !municipio}>
                <span className="btn-content">
                  {cargando && <span className="spinner"></span>}
                  Consultar Población
                </span>
              </button>
            </form>

            {resultado !== null && (
              <div className="result-enter">
                <div className="resultado-glow" style={styles.resultadoCard}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.8 }}>Población Total ({ano})</p>
                  <h3 style={{ margin: 0, fontSize: '32px', color: isDarkMode ? PALETTE.goldSoft : PALETTE.wine }}>
                    {resultado.toLocaleString()}
                  </h3>
                </div>
                
                <button 
                  className="interactive-btn no-capturar" 
                  type="button" 
                  style={styles.graficaButton} 
                  onClick={alternarPerfil}
                >
                  {mostrarPerfil ? 'Ocultar Perfil Demográfico' : 'Ver Perfil Demográfico'}
                </button>
                
                {mostrarPerfil && (
                  <div style={styles.proCard} className="result-enter">
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}} className="no-capturar">
                      <div style={{flex: 1}}>
                        <label style={{...styles.label, fontSize: '10px'}}>Inicio</label>
                        <input type="number" className="interactive-input" style={{...styles.input, padding: '8px'}} value={rangoInicio} onChange={(e) => setRangoInicio(e.target.value)} />
                      </div>
                      <div style={{flex: 1}}>
                        <label style={{...styles.label, fontSize: '10px'}}>Fin</label>
                        <input type="number" className="interactive-input" style={{...styles.input, padding: '8px'}} value={rangoFin} onChange={(e) => setRangoFin(e.target.value)} />
                      </div>
                      <button className="interactive-btn" type="button" style={{...styles.graficaButton, marginTop: '20px', flex: 1}} onClick={consultarPiramide}>
                        Actualizar
                      </button>
                    </div>

                    {datosPiramide && (
                      <>
                        <h4 style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: '15px' }}>
                          Perfil Demográfico ({rangoInicio} - {rangoFin})
                        </h4>

                        {/* EL BOTÓN PARA ALTERNAR GRÁFICAS */}
                        <button 
                          className="interactive-btn no-capturar" 
                          type="button" 
                          style={{ ...styles.exportButtonPdf, marginBottom: '15px' }} 
                          onClick={() => setVistaPerfil(vistaPerfil === 'piramide' ? 'pastel' : 'piramide')}
                        >
                          {vistaPerfil === 'piramide' ? 'Ver Gráfica de Pastel (Total Hombres vs Mujeres)' : 'Ver Pirámide Demográfica'}
                        </button>

                        {/* RENDERIZADO CONDICIONAL DE LA GRÁFICA */}
                        <div style={{ height: '300px' }}>
                          {vistaPerfil === 'piramide' ? (
                            <ResponsiveContainer width="100%" height="100%">
                              {/* Aquí usamos [...datosPiramide].reverse() para invertir el orden de 0-4 a 85+ */}
                              <BarChart layout="vertical" data={[...datosPiramide].reverse()} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                <XAxis type="number" tickFormatter={(val) => Math.abs(val)} stroke={isDarkMode ? '#fff' : '#000'} />
                                <YAxis dataKey="edad" type="category" stroke={isDarkMode ? '#fff' : '#000'} />
                                <Tooltip formatter={(val) => Math.abs(val)} contentStyle={{backgroundColor: isDarkMode ? '#333' : '#fff'}} />
                                <Bar dataKey="hombres" fill={PALETTE.wine} name="Hombres" />
                                <Bar dataKey="mujeres" fill={PALETTE.gold} name="Mujeres" />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Hombres', value: datosPiramide.reduce((acc, d) => acc + Math.abs(d.hombres || 0), 0), color: PALETTE.wine },
                                    { name: 'Mujeres', value: datosPiramide.reduce((acc, d) => acc + Math.abs(d.mujeres || 0), 0), color: PALETTE.gold }
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                >
                                  {
                                    [
                                      { color: PALETTE.wine },
                                      { color: PALETTE.gold }
                                    ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))
                                  }
                                </Pie>
                                <Tooltip formatter={(value) => value.toLocaleString()} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button 
                  className="interactive-btn no-capturar" 
                  type="button" 
                  style={{ ...styles.exportButtonPdf, marginTop: '15px' }} 
                  onClick={exportarPDF}
                >
                  Exportar a PDF
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="vista-transition" ref={capturaRef}>
            <div style={styles.title}>Análisis Comparativo</div>
            <form onSubmit={compararPoblacion}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="campo-glow">
                  <label style={styles.label}>Estado A</label>
                  <select className="interactive-input" style={styles.input} value={estadoA} onChange={handleEstadoAChange}>
                    <option value="">Seleccione un estado</option>
                    {Object.keys(estadosData).map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                  <label style={styles.label}>Municipio A</label>
                  <select className="interactive-input" style={styles.input} value={munA} onChange={(e) => setMunA(e.target.value)}>
                    <option value="">Seleccione municipio A</option>
                    {municipiosListaA.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                </div>
                
                <button type="button" className="interactive-btn swap-btn" style={styles.swapButton} onClick={intercambiarMunicipios} title="Invertir Municipios">
                  ⇅
                </button>
                
                <div className="campo-glow">
                  <label style={styles.label}>Estado B</label>
                  <select className="interactive-input" style={styles.input} value={estadoB} onChange={handleEstadoBChange}>
                    <option value="">Seleccione un estado</option>
                    {Object.keys(estadosData).map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                  <label style={styles.label}>Municipio B</label>
                  <select className="interactive-input" style={styles.input} value={munB} onChange={(e) => setMunB(e.target.value)}>
                    <option value="">Seleccione municipio B</option>
                    {municipiosListaB.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="campo-glow" style={{ marginTop: '15px' }}>
                <label style={styles.label}>Año a Comparar</label>
                <input type="number" className="interactive-input" style={styles.input} value={ano} onChange={(e) => setAno(e.target.value)} required />
              </div>
              
              <button type="submit" className="interactive-btn" style={styles.button(cargando, isDarkMode)} disabled={cargando || !munA || !munB}>
                <span className="btn-content">
                  {cargando && <span className="spinner"></span>}
                  Comparar Población
                </span>
              </button>
            </form>

            {resultados.a !== null && resultados.b !== null && (
              <div className="result-enter" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="resultado-glow" style={{ ...styles.resultadoCard, flex: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>{nombresCongelados.a}</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: PALETTE.wine }}>{resultados.a.toLocaleString()}</h3>
                  </div>
                  <div className="resultado-glow" style={{ ...styles.resultadoCard, flex: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>{nombresCongelados.b}</p>
                    <h3 style={{ margin: 0, fontSize: '24px', color: PALETTE.gold }}>{resultados.b.toLocaleString()}</h3>
                  </div>
                </div>

                <div style={{ height: '250px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: nombresCongelados.a, value: resultados.a, fill: PALETTE.wine },
                      { name: nombresCongelados.b, value: resultados.b, fill: PALETTE.gold }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#444' : '#eee'} />
                      <XAxis dataKey="name" stroke={isDarkMode ? '#fff' : '#000'} />
                      <YAxis tickFormatter={formatCompacto} stroke={isDarkMode ? '#fff' : '#000'} />
                      <Tooltip content={<ComparativaTooltip />} cursor={{ fill: isDarkMode ? '#333' : '#f5f5f5' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {
                          [
                            { fill: PALETTE.wine },
                            { fill: PALETTE.gold }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;