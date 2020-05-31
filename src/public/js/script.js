$(function () {

    let callback = function () { };

    getKeywords();

    if ($("#keywords").val() == -1)
        $("#actions .dynamic").css("display", "none")
    else
        $("#actions .dynamic").css("display", "inline")

    $("#keywords").change(function () {
        if ($(this).val() == -1)
            $("#actions .dynamic").css("display", "none")
        else
            $("#actions .dynamic").css("display", "inline")
    })

    $("#addKeyword").click(function (event) {

        callback = function () {
            console.log("ajout keyword")
        }

        $("#addText").css("display", "block")
        $("#modalAction .modal-header").addClass("bg-info")
        $("#modalAction #modalTitle").text("Ajouter un keyword")
        $("#modalAction .modal-footer button:eq(0)")
            .removeClass("btn-warning")
            .removeClass("btn-danger")
            .addClass("btn-info").text("Ajouter")
        addEventListener("click", function () {
            const input = document.getElementById("addText");
            console.log(input);
        });

    });


    $("#deleteKeyword").click(function (event) {

        callback = function () {
            // Delete a keyword
            const keyword = $("#keywords option:selected").text();
            var url = "/keywords/" + keyword;
            var xhr = new XMLHttpRequest();
            xhr.open("DELETE", url, true);
            xhr.onload = function () {
                var result = JSON.parse(xhr.responseText);
                if (xhr.readyState == 4 && xhr.status == "200") {
                    //Refresh page
                    document.location.reload(true);
                } else {
                    console.error(result);
                }
            }
            xhr.send(null);
        }

        $("#keywordName").text($("#keywords option:selected").text())
        $("#deleteText").css("display", "block")
        $("#modalAction .modal-header").addClass("bg-danger")
        $("#modalAction #modalTitle").text("Supprimer un keyword")
        $("#modalAction .modal-footer button:eq(0)")
            .removeClass("btn-warning")
            .removeClass("btn-info")
            .addClass("btn-danger")
            .text("Confirmer")
    });

    $("#modalAction").on("hidden.bs.modal", function (e) {
        $(".modal-header", this).removeClass("bg-info")
            .removeClass("bg-warning")
            .removeClass("bg-danger")
        $("#addText, #deleteText").css("display", "none")
    })

    //préciser l'action des différents boutons :


    $("#confirmAction").click(function () {
        callback();
    })

    renderChart();
})

function getKeywords() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "/keywords", true);

    xhr.onload = function () {
        const keywords = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            console.log(keywords);
            const keywordsList = document.getElementById("keywords");
            keywords.forEach(element => {
                const newOption = document.createElement("option");
                newOption.text = element.word;
                newOption.value = element.user.date_ajout;
                keywordsList.add(newOption);
            });
        } else {
            console.error(keywords);
        }
    }
    xhr.send(null);
}


function renderChart() {
    const ctx = document.getElementById("myChart")
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Nombre de tweets',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ["#8fe7ff"],
                borderColor: ["#0ba9d4"],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}