$(function() {

    const info = "#138496";
    const success = "#218838";
    const warning = "#e0a800";
    const danger = "#dc3545";

    if ($("#keywords").val() == -1)
        $("#actions .dynamic").css("display", "none")
    else
        $("#actions .dynamic").css("display", "inline")

    $("#keywords").change(function() {
        if ($(this).val() == -1)
            $("#actions .dynamic").css("display", "none")
        else
            $("#actions .dynamic").css("display", "inline")
    })
    
    $("#addKeyword").click(function(event){
        $("#addText").css("display","block")
        $("#modalAction .modal-header").addClass("bg-info")
        $("#modalAction #modalTitle").text("Ajouter un keyword")
        $("#modalAction .modal-footer button:eq(0)")
        .removeClass("btn-warning")
        .removeClass("btn-danger")
        .addClass("btn-info").text("Soumettre ajout")
    });


    $("#deleteKeyword").click(function(event){
        $("#deleteText").css("display","block")
        $("#modalAction .modal-header").addClass("bg-danger")
        $("#modalAction #modalTitle").text("Supprimer un keyword")
        $("#modalAction .modal-footer button:eq(0)")
        .removeClass("btn-warning")
        .removeClass("btn-info")
        .addClass("btn-danger")
        .text("Confirmer")
    });

    $("#modalAction").on("hide.bs.modal",function(e){
        $(".modal-header",this).removeClass("bg-info")
            .removeClass("bg-warning")
            .removeClass("bg-danger")
        $("#addText, #deleteText").css("display","none")    
    })

    renderChart();
})




function renderChart()
{
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