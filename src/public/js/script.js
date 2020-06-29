$(function () {

    let callback = function () { };

    getKeywords();

    let chart = null;

    if ($("#keywords").val() == -1)
        $("#actions .dynamic").css("display", "none")
    else
        $("#actions .dynamic").css("display", "inline")

    $("#keywords").change(function () {
        if ($(this).val() == -1)
            $("#actions .dynamic").css("display", "none")
        else {
            $("#actions .dynamic").css("display", "inline")
            fetchStats($(this).val()).done(function(data){
                
                const labels = data.map(function(stat){
                    return stat.date;
                });

                data = data.map(function(stat){
                    return stat.nb_tweets
                });
                console.log(data);
                renderChart(chart,labels,data)
            })
        }
    })

    $("#addKeyword").click(function (event) {

        callback = function () {
            const newKeyword = $("#newKeywordInput").val();
            const url = "/keywords";

            const data = {};
            data.word = newKeyword;
            const json = JSON.stringify(data);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.onload = function () {
                const response = JSON.parse(xhr.responseText);
                if ((xhr.readyState == 4 && xhr.status == "201") ||
                    (xhr.readyState == 4 && xhr.status == "200")) {
                    //Refresh page
                    document.location.reload(true);
                } else {
                    $("#addTextError").text(response.message);
                }
            }
            xhr.send(json);
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
        if (!keywords.message) {
            if (xhr.readyState == 4 && xhr.status == "200") {
                const keywordsList = document.getElementById("keywords");
                keywords.forEach(element => {
                    const newOption = document.createElement("option");
                    newOption.text = element.word;
                    newOption.value = element.word+"&"+element.user.date_ajout;
                    keywordsList.add(newOption);
                });
            } else {
                console.error(keywords);
            }
        }
    }
    xhr.send(null);
}

    




function fetchStats(value)
{
    const array = value.split("&");
    const word = array[0];
    const date = array[1];
    return $.ajax({
        method: "GET",
        url: "/stats/"+word+"/"+date
    })
}


function renderChart(chart,labels,data)
{
  
    const ctx = document.getElementById("myChart")
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                label: 'Nombre de tweets',
                backgroundColor: ["#8fe7ff"],
                borderColor: ["#0ba9d4"],
                borderWidth: 2
            }]
        },
        options: {
            tooltips:{
                backgroundColor: "#242d4f",
                
                callbacks:{
                    title: (item,data) => {
                        return new Date(item[0].xLabel).toLocaleString('fr-FR')
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }],
                xAxes: [{
                    ticks:{
                        callback: function(value){
                            return new Date(value).toLocaleString('fr-FR')
                        }
                    }
                }]
            },
            animation:{
                duration: 0
            }
        }

    });
}