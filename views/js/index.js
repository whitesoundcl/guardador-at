const electron = require('electron');
const { ipcRenderer } = electron;

const salidaSerial = document.getElementById("salidaSerial");
const cmdEnviar = document.getElementById("cmdEnviar");
const btnEnviarCmd = document.getElementById("btnEnviarCmd");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnIniciarConexion = document.getElementById("btnIniciarConexion");
const btnCerrarConexion = document.getElementById("btnCerrarConexion");
const txtPuertoSerial = document.getElementById("txtPuertoSerial");
const txtComandoGuardar = document.getElementById("txtComandoGuardar");
const txtParametrosGuardar = document.getElementById("txtParametrosGuardar");
const txtNombreGuardar = document.getElementById("txtNombreGuardar");
const txtDescripcionGuardar = document.getElementById("txtDescripcionGuardar");
const btnGuardarComando = document.getElementById("btnGuardarComando");
const lblError = document.getElementById("lblError");
const listaComandos = document.getElementById("listaComandos");
//const socket = io.connect('http://localhost:4000', { 'forceNew': true });
var arregloComandos = [];
var arregloBotones = document.getElementsByClassName("comando");

function agregarBotonComando(index, comando) {

    listaComandos.innerHTML +=
        `<a class="waves-effect waves-light btn comando" name=${index} >${comando.nombre}(${comando.comando})</a><br>`;

}

function agregarLinea(quienEs, texto) {
    salidaSerial.innerHTML +=
        "<br> <span class='purple-text text-lighten-5'><b>" + quienEs + "></b>" + texto + "</span>";
    salidaSerial.scrollTop = salidaSerial.scrollHeight
}

function limpiarSalida() {
    salidaSerial.innerHTML = "";
}

function enviarComando() {
    agregarLinea("Comando Enviado", cmdEnviar.value);
    ipcRenderer.send('comando', cmdEnviar.value);
    cmdEnviar.value = "";
}

function actualizarGuardarComandos(comando) {
    if(comando.nombre){
        txtNombreGuardar.value = comando.nombre;
        txtComandoGuardar.value = comando.comando;
        txtDescripcionGuardar.value = comando.descripcion;
        txtParametrosGuardar.value = comando.parametros;
    } else {
        txtNombreGuardar.value = "";
        txtComandoGuardar.value = "";
        txtDescripcionGuardar.value = "";
        txtParametrosGuardar.value = "";
        let split = comando.split("=");
        txtNombreGuardar.value = split[0];
        txtComandoGuardar.value = split[0];
        if (comando.includes("=")) {
            txtParametrosGuardar.value = split[1];
        }
        
    }
        
}

ipcRenderer.on("linea", (e, texto) => {
    agregarLinea("Serial Dice", texto);
});
ipcRenderer.on("err", (e, texto)=>{
    emitirError(texto);
    
    
});


ipcRenderer.on('comandos', (e, comandos) => {
    arregloComandos = comandos.comandos;
    listaComandos.innerHTML = "";
    for (let i = 0; i < arregloComandos.length; i++) {
        const comando = arregloComandos[i];
        agregarBotonComando(i, comando);
    }
    arregloBotones = document.getElementsByClassName("comando");
    for (let i = 0; i < arregloBotones.length; i++) {
        const boton = arregloBotones[i];
        boton.onclick = (e) => {
            e.preventDefault();
            let comando = arregloComandos[boton.name];
            cmdEnviar.value = comando.comando;
            if (comando.parametros.length > 0) {
                cmdEnviar.value += `=${comando.parametros}`;
            }
            cmdEnviar.focus();
            actualizarGuardarComandos(comando);
        }
    }
});
btnCerrarConexion.onclick =() =>{
    ipcRenderer.send("desconectar");

}

btnIniciarConexion.onclick = () =>{
    if(txtPuertoSerial.value.length > 0){
        ipcRenderer.send("conectar", {dispositivo : txtPuertoSerial.value, baudios: 9600});
    } else {
        emitirError("¿A que puerto debo conectarme?");

    }
}

btnGuardarComando.onclick = () => {
    let comandoNuevo = {
        nombre: txtNombreGuardar.value,
        descripcion: txtDescripcionGuardar.value,
        comando: txtComandoGuardar.value,
        parametros: txtParametrosGuardar.value
    }
    arregloComandos.push(comandoNuevo);
    ipcRenderer.send("comando nuevo", { comandos: arregloComandos });
}

btnEnviarCmd.onclick = (e) => {
    enviarComando();
}

cmdEnviar.onkeyup = (e)=>{
    if(e.keyCode == 8) {
        actualizarGuardarComandos(cmdEnviar.value);
    } else if (e.keyCode == 13) {
        enviarComando();
    } else {
        actualizarGuardarComandos(cmdEnviar.value);
    }
}




btnLimpiar.onclick = () => {
    limpiarSalida();
}

setTimeout(() => {
    ipcRenderer.send("lista comandos", { comandos: arregloComandos });
}, 1000);

const emitirError = (error) =>{
    lblError.innerHTML = error;

}