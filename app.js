let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    textContent = "";

function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then((page) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
            textContent = "";
            return page.getTextContent();
        }).then((textContent) => {
            textContent.items.forEach((text) => {
                textContent += text.str + " ";
            });
        });

        document.getElementById("pdf-container").innerHTML = "";
        document.getElementById("pdf-container").appendChild(canvas);

        pageRendering = false;

        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
    });
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
        pdfDoc = pdfDoc_;
        renderPage(pageNum);
    });
}

function saveChanges() {
    const newText = document.getElementById("text-editor").value;
    const currentPage = pdfDoc.getPage(pageNum);

    currentPage.then((page) => {
        const textDiv = document.createElement("div");
        textDiv.textContent = newText;

        const textContent = textDiv.textContent;

        const textItem = {
            str: textContent,
            transform: [1, 0, 0, 1, 100, 100], // Adjust these values as needed
        };

        page.getTextContent().then((textContent) => {
            textContent.items.push(textItem);

            const opList = pdfjsLib.OPS.paintText(textContent);
            const argsArray = [opList];

            const textRenderingState = {
                textContent: textContent,
                style: null,
            };

            pdfjsLib.drawText(page, true, textRenderingState, argsArray);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const pdfUrl = "path/to/your/example.pdf"; // Replace with your PDF file
    loadPDF(pdfUrl);
});
