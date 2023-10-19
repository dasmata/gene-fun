class FileWriter {
    fileObjectURL;
    downloadLink;

    constructor(){
        this.fileObjectURL = null;
    }

    download(text, filename){
        this.createFile(text);
        this.initDownload(filename)
    }


    createFile(text){
        const data = new Blob([text], {type: 'text/plain'});
        if (this.fileObjectURL) {
            window.URL.revokeObjectURL(this.fileObjectURL);
        }
        this.fileObjectURL = window.URL.createObjectURL(data);
    }

    initDownload(filename){
        if(this.downloadLink){
            document.removeChild(this.downloadLink);
        }

        this.downloadLink = document.createElement('a');
        this.downloadLink.setAttribute('href', this.fileObjectURL);
        this.downloadLink.setAttribute('download', filename);
        this.downloadLink.click();
        window.URL.revokeObjectURL(this.fileObjectURL);
        this.fileObjectURL = null;
    }
}

export { FileWriter }
