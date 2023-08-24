// Representa el índice del jugador actual
let jugadorActual = -1;

let participantes = [];

// Representa el ángulo actual de la ruleta
let anguloActual = 0;

// Constante para los puntos otorgados por respuesta correcta
const PUNTOS_POR_RESPUESTA_CORRECTA = 100;

// Array para mantener un registro de las preguntas ya respondidas
const preguntasRespondidas = [];

function dataLoad() {
    // Carga de preguntas desde preguntas.json
    fetch('preguntas.json')
      .then(response => response.json())
      .then(data => {
        window.preguntas = data;
      })
      .catch(error => {
        console.error('Error al cargar preguntas.json:', error);
      });

    // Carga de participantes desde participantes.json
    fetch('participantes.json')
      .then(response => response.json())
      .then(data => {
        window.participantes = data;
        configurarJuego(); // Llama a la función después de cargar los participantes
      })
      .catch(error => {
        console.error('Error al cargar participantes.json:', error);
      });
}

// Array para almacenar los puntajes de los jugadores
const puntajes = new Array(participantes.length).fill(0);

// Función para animar la ruleta
function animarRuleta() {
    const ruleta = document.getElementById('ruleta');
    const duracion = 5000; // Duración de la animación en milisegundos
    const anguloPorSegmento = 360 / participantes.length; // Ángulo por cada segmento de la ruleta
    const vueltas = 5; // Número de vueltas completas
    const anguloFinal = anguloPorSegmento * (jugadorActual + 1); // Ángulo final de la animación
  
    // Calcula el ángulo total de la animación
    const anguloAnimacion = vueltas * 360 + anguloFinal - anguloActual;
    
    // Actualiza el ángulo actual
    anguloActual += anguloAnimacion;
  
    // Crea la animación
    ruleta.style.transition = `transform ${duracion}ms ease-out`;
    ruleta.style.transform = `rotate(${anguloActual}deg)`;
  
    // Espera a que termine la animación y luego selecciona al jugador
    setTimeout(seleccionarJugador, duracion);
  }
  
// Función para seleccionar al jugador
function seleccionarJugador() {
    // Incrementa el índice del jugador actual
    jugadorActual = (jugadorActual + 1) % participantes.length;
  
    // Obtiene el segmento correspondiente al jugador actual
    const segmento = document.getElementById(`segmento-${jugadorActual}`);
  
    // Agrega una clase para destacar el segmento seleccionado, if it exists
    if (segmento) {
      segmento.classList.add('seleccionado');
    } else {
      console.error(`Segmento con ID segmento-${jugadorActual} no encontrado`);
    }
  
    // Aquí puedes continuar con la lógica del juego, como mostrar las preguntas al jugador seleccionado
  }
  
  function reproducirAudio(tipo) {
    let archivo;
  
    switch (tipo) {
      case 'theme':
        archivo = 'sfx/theme.mp3';
        break;
      case 'question_round':
        archivo = 'sfx/question_round.mp3';
        break;
      case 'timer':
        archivo = 'sfx/timer.mp3';
        break;
      case 'correct':
        archivo = 'sfx/correct.mp3';
        break;
      case 'wrong':
        archivo = 'sfx/wrong.mp3';
        break;
      default:
        console.error('Tipo de sonido desconocido:', tipo);
        return;
    }
  
    const audio = new Audio(archivo);
    audio.play();
  }
  
  function gestionarTurnosYpuntajes(respuestaCorrecta) {
    // Si la respuesta es correcta, suma los puntos al jugador actual
    if (respuestaCorrecta) {
      puntajes[jugadorActual] += PUNTOS_POR_RESPUESTA_CORRECTA;
    }
  
    // Presentación del puntaje actual
    document.getElementById(`puntaje-${jugadorActual}`).innerText = puntajes[jugadorActual];
  
    // Verifica si el jugador actual ha respondido tres preguntas
    if (preguntasRespondidas.length % 3 === 0) {
      // Finaliza el turno del jugador actual y reproduce la música de fondo
      reproducirAudio('theme');
  
      // Espera cinco segundos antes de empezar a girar la ruleta
      setTimeout(animarRuleta, 5000);
  
      // Si todos los jugadores han jugado, muestra el puntaje final
      if (jugadorActual === participantes.length - 1) {
        // Aquí puedes agregar la lógica para mostrar el puntaje total
        const puntajeTotal = puntajes.reduce((total, puntaje) => total + puntaje, 0);
        alert(`Puntaje final: ${puntajeTotal}`);
      }
    } else {
      // Continúa con la siguiente pregunta para el jugador actual
      mostrarPregunta();
    }
  }
  
  class InteraccionUsuario {
    constructor() {
      // Vincula las funciones de la clase con la instancia actual
      this.responder = this.responder.bind(this);
      this.mostrarPregunta = this.mostrarPregunta.bind(this);
    }
  
    // Función para manejar la respuesta del jugador
    responder(pregunta, respuestaSeleccionada) {
      // Comprueba si la respuesta es correcta
      const esCorrecta = respuestaSeleccionada === pregunta.correcta;
  
      // Reproduce el audio correspondiente
      reproducirAudio(esCorrecta ? 'correct' : 'wrong');
  
      // Aplica un efecto visual a la opción seleccionada
      const opcion = document.getElementById(`opcion-${respuestaSeleccionada}`);
      opcion.classList.add(esCorrecta ? 'correcta' : 'incorrecta');
  
      // Invoca la función de gestión de turnos y puntajes
      gestionarTurnosYpuntajes(esCorrecta);
    }
  
    // Función para mostrar una pregunta
    mostrarPregunta() {
      // Selecciona una pregunta aleatoria que aún no haya sido respondida
      let preguntaIndex;
      do {
        preguntaIndex = Math.floor(Math.random() * preguntas.length);
      } while (preguntasRespondidas.includes(preguntaIndex));
      preguntasRespondidas.push(preguntaIndex);
      const pregunta = preguntas[preguntaIndex];
  
      // Muestra el título de la pregunta
      const tituloPregunta = document.getElementById('titulo-pregunta');
      tituloPregunta.innerText = pregunta.pregunta;
  
      // Reproduce el archivo "question_round"
      reproducirAudio('question_round');
  
      // Muestra las opciones en intervalos de tres segundos
      const opcionesContainer = document.getElementById('opciones');
      opcionesContainer.innerHTML = ''; // Limpia las opciones anteriores
      pregunta.respuestas.forEach((respuesta, index) => {
        setTimeout(() => {
          const opcion = document.createElement('li');
          opcion.id = `opcion-${index}`;
          opcion.innerText = respuesta;
          opcion.onclick = () => this.responder(pregunta, index); // Asigna la función responder al hacer clic
          opcionesContainer.appendChild(opcion);
        }, index * 3000);
      });
  
      // Reproduce el archivo "timer" tres segundos después de mostrar todas las opciones
      setTimeout(() => {
        reproducirAudio('timer');
      }, pregunta.respuestas.length * 3000);
    }
  }
  
  function adaptarRuleta() {
    // Obtener el contenedor de la ruleta
    const ruleta = document.getElementById('ruleta');
  
    // Eliminar el segmento correspondiente al jugador actual
    const segmentoActual = document.getElementById(`segmento-${jugadorActual}`);
    if (segmentoActual) {
      ruleta.removeChild(segmentoActual);
    }
  
    // Ajustar la ruleta según el número de jugadores restantes
    const jugadoresRestantes = participantes.length - 1;
    const anguloPorSegmento = 360 / jugadoresRestantes;
    const segmentos = ruleta.children;
    for (let i = 0; i < segmentos.length; i++) {
      const segmento = segmentos[i];
      // Ajustar el ángulo de cada segmento
      const angulo = i * anguloPorSegmento;
      segmento.style.transform = `rotate(${angulo}deg)`;
    }
  }
  
  function juegoTerminado() {
    // Comprobar si todos los jugadores han jugado
    return jugadorActual >= participantes.length - 1;
  }

  function presentarResultadosFinales() {
    // Obtener o crear un contenedor para mostrar los resultados
    const resultadosContainer = document.getElementById('resultados') || document.createElement('div');
    resultadosContainer.id = 'resultados';
    
    // Crear una lista con los nombres y puntajes de los jugadores
    const listaResultados = document.createElement('ul');
    participantes.forEach((participante, index) => {
      const item = document.createElement('li');
      item.innerText = `${participante.nombre}: ${participante.puntaje} puntos`;
      listaResultados.appendChild(item);
    });
  
    // Agregar la lista al contenedor
    resultadosContainer.appendChild(listaResultados);
  
    // Agregar el contenedor a la página si aún no está presente
    if (!document.getElementById('resultados')) {
      document.body.appendChild(resultadosContainer);
    }
  
  }
    

  // Ejemplo de uso después de seleccionar un jugador y antes de pasar al siguiente turno
  seleccionarJugador();
  adaptarRuleta();
  

  // Crea una instancia de la clase
  const interaccion = new InteraccionUsuario();
  
  // Llama a interaccion.mostrarPregunta para comenzar la ronda de preguntas
  interaccion.mostrarPregunta();
  
  
  // Llama a animarRuleta para iniciar la animación
  animarRuleta();


  // Llama a la función dataLoad para cargar los datos cuando la página esté cargada
  window.onload = dataLoad;
  
