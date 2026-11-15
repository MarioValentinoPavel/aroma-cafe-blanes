// Datos del negocio en un solo sitio. Si cambia el horario, se cambia aquí (y en el JSON-LD y el pie del index.html).
// Horario de la ficha de Google, comprobado el 15-11-2026. Minutos desde las 0:00; domingo = 0.
window.AROMA = {
  tz: 'Europe/Madrid',
  hours: {
    0: [[540, 1080]], // domingo 9:00-18:00
    1: [[540, 1080]], // lunes
    2: [[540, 1080]], // martes
    3: [],            // miércoles, cerrado
    4: [[540, 1080]], // jueves
    5: [[540, 1080]], // viernes
    6: [[540, 1380]]  // sábado 9:00-23:00
  }
};
