$(function() {

    let chart = null;

    let callback = function(){};

    if ($("#keywords").val() == -1)
        $("#actions .dynamic").css("display", "none")
    else
        $("#actions .dynamic").css("display", "inline")

    $("#keywords").change(function() {
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
    
    $("#addKeyword").click(function(event){
        
        callback = function(){
            console.log("ajout keyword")
        }

        $("#addText").css("display","block")
        $("#modalAction .modal-header").addClass("bg-info")
        $("#modalAction #modalTitle").text("Ajouter un keyword")
        $("#modalAction .modal-footer button:eq(0)")
        .removeClass("btn-warning")
        .removeClass("btn-danger")
        .addClass("btn-info").text("Ajouter")
    });


    $("#deleteKeyword").click(function(event){
        
        callback = function(){
            console.log("suppression keyword")
        }

        $("#keywordName").text($("#keywords").val())
        $("#deleteText").css("display","block")
        $("#modalAction .modal-header").addClass("bg-danger")
        $("#modalAction #modalTitle").text("Supprimer un keyword")
        $("#modalAction .modal-footer button:eq(0)")
        .removeClass("btn-warning")
        .removeClass("btn-info")
        .addClass("btn-danger")
        .text("Confirmer")
    });

    $("#modalAction").on("hidden.bs.modal",function(e){
        $(".modal-header",this).removeClass("bg-info")
            .removeClass("bg-warning")
            .removeClass("bg-danger")
        $("#addText, #deleteText").css("display","none")    
    })

    //préciser l'action des différents boutons :

    
    $("#confirmAction").click(function(){
        callback();
    })



    
})


function fetchStats(word)
{
    return $.ajax({
        method: "GET",
        url: "/stats/"+word
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