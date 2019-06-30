const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path");
const FileImporter = require(path.join(__dirname, 'FileImporter'));
const SerialHelper = require(path.join(__dirname, 'SerialHelper'));

const rutaJsonComandos = path.join(__dirname, 'json/comandosGuardados.json');


let serial = false;

// Crea la ventana de navegador:
function iniciarVista() {
    let ventana = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Carga la página inicial del sistema:
    ventana.loadFile('views/index.html')

    /**
     * Este evento retorna toda la lista de comandos
     */
    ipcMain.on("lista comandos", (e, data) => {
        emitirComandos();
    });

    /**
     * Envia un comando a la placa
     */
    ipcMain.on("comando", (e,texto)=>{
        //console.log(`recibido: ${texto}`);z 
        if (serial) {
            serial.getPort().write(texto+'\r');
            //console.log(texto);
            
        } else {
            emitirError("No hay comunicación serial");
        }
    });

    /**
     * Cada vez que en la vista se cree un comando nuevo, este
     * evento será ejecutado.
     */
    ipcMain.on("comando nuevo", (e, comandos)=>{
        FileImporter.saveJSONFile(rutaJsonComandos, comandos);
        emitirComandos();
    })

    /**
     * Este evento busca realizar la comunicacion serial.
     */
    ipcMain.on("conectar", (e, info)=>{
        serial = new SerialHelper(info.dispositivo, info.baudios, (error)=>{
            if (error) {
                emitirError(error)
                serial = false;
            } else {
                console.log("Comunicacion serial existosa");
                serial.getParser().on("data", (data)=>{
                    
                    ventana.webContents.send("linea", data );
            
                });
            }
        });
    });

    
    /**
     * Esta función emite la lista de comandos almacenados
     * en el json de comandosGuardados.
     */
    function emitirComandos() {
        ventana.webContents.send("comandos",FileImporter.readJSONFile(rutaJsonComandos) );
    }
    /**
     * Esta función es llamada cada vez que el programa encuentra algún problema.
     * @param {String} e Texto del error a emitir
     */
    function emitirError(e) {
        console.log(`Se ha emitido un error: ${e}`);
        ventana.webContents.send("error", e);
    }
}

app.on('ready', iniciarVista);

