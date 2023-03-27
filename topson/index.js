var socket = io()
var username, avatar, room
var press = 0
var page = 0
var interval = 20

$('#avatars a').on('click', function() {
    $('#avatars a').find('.avatar_img').css("border", "#00CED1 0px solid")
    $('#avatars a').find('.avatar_img').removeClass('now')
    $(this).find('.avatar_img').css("border", "#00CED1 3px solid")
    $(this).find('.avatar_img').addClass('now')
})

$('#loginBtn').on('click', function() {

    username = $("#username").val().trim()
    if(!username) {
        alert('Please enter username.')
        return
    }
    
    avatar = $('#avatars img.now').attr('src')
    room = $("#roomNum").val().trim()
    
    var arg1 = /^\d{4}$/
    var arg2 = /^\d{7}$/
    if (room.match(arg1) == null && (room.match(arg2) == null)) {
        alert('Please enter correct room No.')
        return
    }
    else {
        if (room.length != 4) {
            interval = Number(room.substring(4, 7))
            room = room.substring(0, 4)
        }
        socket.emit('login', {
            username: username,
            avatar: avatar,
            room: room
        })
    }
})

socket.on('loginError', data => {
    alert('Username existed.')
})
  
socket.on('loginSuccess', data => {
    $('#login').fadeOut()
    $('#chat').fadeIn()
    $('.avatar_profile').attr('src', data.avatar)
    $('.username_profile').text(data.username)
    $('#room_number').text(data.room)

    var myDate = new Date()
    var year=myDate.getFullYear()      
    var month=myDate.getMonth() 
    var date=myDate.getDate()
    var monthEng = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var now=getNow(date)+' '+monthEng[month]+" "+year
    $('.date_bg').text(now)

    username = data.username
    avatar = data.avatar
    room = data.room
    page = 1
})

socket.on('addUser', data => {
    $('.system_info').append(`
        <div class="text-opacity-80 w-4/5 mt-2 text-gray-800 dark:text-gray-500">${data.username} joined the chatroom.</div>
    `)
    $('.system_info').children(':last').get(0).scrollIntoView(false)
})

socket.on('userList', data => {
    $('.user_list').html('')
    var count = 0
    
    data.forEach(item => {
        if (item.room == room) {
            $('.user_list').append(`
                <a class="w-12 mr-3 cursor-pointer tooltip" title=${item.username}>
                    <div class="w-12 h-12 flex-none image-fit rounded-full">
                        <img class="rounded-full" src=${item.avatar}>
                    </div>
                    <div class="text-gray-600 dark:text-gray-500 truncate text-center mt-2">${item.username}</div>
                </a>
            `)
            count++
        }
    })
    $('#userCount').text(count)
    clearData()
})

socket.on('delUser', data => {
    $('.system_info').append(`
        <div class="text-opacity-80 w-4/5 mt-2 text-gray-800 dark:text-gray-500">${data.username} left the chatroom.</div>
    `)
    $('.system_info').children(':last').get(0).scrollIntoView(false)
    var count = Number($('#userCount').text())-1
    $('#userCount').text(count)
})

$('.btn-send').on('click', () =>{
    var content = $('#content').val()
    $('#content').val('')
    if (!content) return alert('Cannot send empty messages')
  
    socket.emit('sendMessage', {
      room: room,
      msg: content,
      username: username,
      avatar: avatar
    })
})

socket.on('receiveMessage', data => {
    if (data.username == username) {
        $('.chat_area').append(`
            <div class="-intro-x chat-text-box flex items-end float-right mb-4">
                <div class="w-full">
                    <div class="chat-text-box__content flex items-center float-right">
                        <div class="box leading-relaxed bg-theme-1 text-opacity-80 text-white px-4 py-3 mt-3">${data.msg}</div>
                    </div>
                </div>
                <div class="w-10 h-10 hidden sm:block flex-none image-fit relative ml-3">
                    <img class="rounded-full" src=${data.avatar}>
                </div>
            </div>
            <div class="clear-both mb-2"></div>
        `)
    } else {
        $('.chat_area').append(`
            <div class="-intro-x chat-text-box flex items-end float-left mb-4">
                <div class="chat-text-box__photo w-10 h-10 hidden sm:block flex-none image-fit relative mr-3">
                    <img class="rounded-full" src=${data.avatar}>
                </div>
                <div class="w-full">
                    <div class="text-gray-600 text-xs">${data.username}</div>
                    <div class="chat-text-box__content flex items-center float-left">
                        <div class="box leading-relaxed dark:text-gray-300 text-gray-700 px-4 py-3 mt-1">${data.msg}</div>
                    </div>
                </div>
            </div>
            <div class="clear-both mb-2"></div>
        `)
    }

    $('.chat_area').children(':last').get(0).scrollIntoView(false)
})

$('.emos').on('click', function() {
    if (press==0){
        press = 1

        var type = $(this).find('.emo_num').attr('id')
        switch (type) {
            case ('emo1'):
                $('#board1').addClass('bg-theme-1 dark:bg-theme-1')
                break
            case ('emo2'):
                $('#board2').addClass('bg-theme-1 dark:bg-theme-1')
                break
            case ('emo3'):
                $('#board3').addClass('bg-theme-1 dark:bg-theme-1')
                break
            case ('emo4'):
                $('#board4').addClass('bg-theme-1 dark:bg-theme-1')
                break
        }
        
        $(this).find('.bg2').removeClass('text-gray-800 dark:text-white')
        $(this).find('.bg2').addClass('text-white')
        $(this).find('.bg3').removeClass('text-gray-800 dark:text-gray-500')
        $(this).find('.bg3').addClass('text-white')

        var emo1 = Number($('#emo1').text())
        var emo2 = Number($('#emo2').text())
        var emo3 = Number($('#emo3').text())
        var emo4 = Number($('#emo4').text())
        var sum = emo1 + emo2 + emo3 + emo4
        var status = ''

        if (sum == 0) {
            status = 'first'
        } 

        socket.emit('emoSend', {
            emo_type: type,
            room: room,
            status: status
        })
    }
})

socket.on('emoReceive', data => {
    var type = '#' + data.emo_type
    var num = Number($('.emos').find(type).text()) + 1
    $('.emos').find(type).text(num)  

    var emo1 = Number($('#emo1').text())
    var emo2 = Number($('#emo2').text())
    var emo3 = Number($('#emo3').text())
    var emo4 = Number($('#emo4').text())

    showData()
    
    if (data.status == 'first') {
        setTimeout(function() {
            $('#board1').removeClass('bg-theme-1 dark:bg-theme-1')
            $('#board2').removeClass('bg-theme-1 dark:bg-theme-1')
            $('#board3').removeClass('bg-theme-1 dark:bg-theme-1')
            $('#board4').removeClass('bg-theme-1 dark:bg-theme-1')

            $('.bg2').addClass('text-gray-800 dark:text-white')
            $('.bg2').removeClass('text-white')
            $('.bg3').addClass('text-gray-800 dark:text-gray-500')
            $('.bg3').removeClass('text-white')

            var emos = []
            var emo_max = []
            var emo1 = Number($('#emo1').text())
            var emo2 = Number($('#emo2').text())
            var emo3 = Number($('#emo3').text())
            var emo4 = Number($('#emo4').text())
            
            emo_max.push({type: 'emo1', num: emo1})
            emos.push({type: 'emo2', num: emo2})
            emos.push({type: 'emo3', num: emo3})
            emos.push({type: 'emo4', num: emo4})

            emos.forEach(item => {
                if (item.num > emo_max[0].num) {
                    emo_max.splice(0, emo_max.length)
                    emo_max.push(item)
                } else if (item.num == emo_max[0].num) {
                    emo_max.push(item)
                }
            })
            
            var myDate = new Date(); 
            var h=myDate.getHours();        
            var m=myDate.getMinutes();         
            var s=myDate.getSeconds();
            var now = getNow(h)+':'+getNow(m)+":"+getNow(s)
            $('.system_info').append(`
                <div class="text-opacity-80 w-4/5 mt-2 text-gray-800 dark:text-gray-500">${now} feedback:</div>
            `)

            emo_max.forEach(item => {
                var type_extra = '#' + item.type
                var msg = $('.emos').find(type_extra).parent('.bg3').prev().text()
                $('.system_info').append(`
                    <div class="text-opacity-80 w-4/5 mt-2 text-gray-800 dark:text-gray-500">${msg}</div>
                `)
            })
            $('.system_info').children(':last').get(0).scrollIntoView(false)

            $('#emo1').text('0')
            $('#emo2').text('0')
            $('#emo3').text('0')
            $('#emo4').text('0')

            clearData()

            press = 0
        }, interval*1000)
    }
})

var myChart = new Chart(
    $('#myPieChart'),
    {
        type: 'doughnut',
        data: {
        labels: ["All good, carry on.", "Can I ask a question?", "I need a break.", "I'm lost! Please wait!", "No feedback."],
        datasets: [{
            data: [0, 0, 0, 0, 1],
            backgroundColor: ['#1cc88a', '#f6c23e', '#4e73df', '#e74a3b', '#D3D3D3'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
        },
        options: {
        maintainAspectRatio: false,
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
        },
        legend: {
            display: false
        },
        cutoutPercentage: 80,
        },
    }
)
  
function addData(chart, data, datasetIndex) {
    chart.data.datasets[datasetIndex].data = data
    chart.update()
}

$('.file_press').on('click', function() {
    document.getElementById("file").click(); 
})

$('#file').on('change', function() {
    var file = this.files[0]
    if (Number(file.size)>500000) {
        imageConversion.compressAccurately(file,500).then(res=>{
            emitImage(res) 
        })
    } else {
        emitImage(file)
    }
})

function emitImage(img){  
    var fr = new FileReader()
    fr.readAsDataURL(img)
    fr.onload = function() {
        socket.emit('sendImage', {
            username: username,
            avatar: avatar,
            room: room,
            img: fr.result
        })
    }       
}

socket.on('receiveImage', data => {
    if (data.username == username) {
        $('.chat_area').append(`
            <div class="intro-x chat-text-box flex items-end float-right mb-4">
                <div class="w-full">
                    <div class="tooltip w-16 h-16 image-fit ml-2 zoom-in" title=${data.img}>
                        <img class="rounded-md" src=${data.img}>
                    </div>
                </div>
                <div class="chat-text-box__photo w-10 h-10 hidden sm:block flex-none image-fit relative ml-3">
                    <img class="rounded-full" src=${data.avatar}>
                </div>
            </div>
            <div class="clear-both mb-2"></div>
        `)
    } else {
        $('.chat_area').append(`
            <div class="-intro-x chat-text-box flex items-end float-left mb-4">
                <div class="chat-text-box__photo w-10 h-10 hidden sm:block flex-none image-fit relative mr-3">
                    <img alt="Topson Messenger Tailwind HTML Admin Template" class="rounded-full" src=${data.avatar}>
                </div>
                <div class="w-full">
                    <div class="text-gray-600 text-xs">${data.username}</div>
                    <div class="tooltip w-16 h-16 image-fit zoom-in" title=${data.img}>
                        <img class="rounded-md" src=${data.img}>
                    </div>
                </div>
            </div>
            <div class="clear-both mb-2"></div>
        `)
    }

    $('.chat_area').children(':last').get(0).scrollIntoView(false)
})

function getNow(time) {
    return time < 10 ? '0' + time: time;
}

$('.emojis button').on('click', function() {
    content = $('#content').val()
    $('#content').val(content+$(this).text())
    $('#emoji_menu').click()
})

$(document).keyup(function(event){
    if(event.keyCode == 13 && page == 0){
        $("#loginBtn").click()
    }
    if(event.keyCode == 13 && page == 1){
        $(".btn-send").click()
    }
})

function showData() {
    var emo1 = Number($('#emo1').text())
    var emo2 = Number($('#emo2').text())
    var emo3 = Number($('#emo3').text())
    var emo4 = Number($('#emo4').text())
    var rest = Number($('#userCount').text())-emo1-emo2-emo3-emo4
    if (rest < 0) rest = 0

    if ($("#onlyVoted").is(':checked')) {
        addData(myChart, [emo1, emo2, emo3, emo4, 0], 0)
    } else {
        addData(myChart, [emo1, emo2, emo3, emo4, rest], 0)
    }
}

function clearData() {
    if ($("#onlyVoted").is(':checked')) {
        addData(myChart, [0, 0, 0, 0, 0], 0)
    } else {
        addData(myChart, [0, 0, 0, 0, Number($('#userCount').text())], 0)
    }
}

$("#onlyVoted").change(function() { 
    showData()
})