var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

const users = []

server.listen(3000, () => {
    console.log('running server')
})

app.use(require('express').static('topson'))
app.get('/', function(req, res) {
    res.redirect('/index.html')
})

io.on('connection', function(socket) {
    console.log('new user')
    socket.on('login', data => {
        let exist = users.find(item => item.username == data.username)
        if (exist) {
            socket.emit('loginError', {msg: 'username existed'})

        } else {
            socket.join(data.room)
            users.push(data)
            socket.emit('loginSuccess', data)
            io.to(data.room).emit('addUser', data)

            io.to(data.room).emit('userList', users)

            socket.username = data.username
            socket.avatar = data.avatar
            socket.room = data.room
        }
    })

    socket.on('disconnect', () => {
        let idx = users.findIndex(item => item.username == socket.username)
        var room = users.slice(idx, idx+1)
        if (!isEmptyObject(room)) {
            roomNum = room[0].room
        } else {
            roomNum = 0
        }
        users.splice(idx, 1)
        io.to(roomNum).emit('delUser', {
            username: socket.username,
            avatar: socket.avatar,
            room: roomNum
        })
        io.to(roomNum).emit('userList', users)
    })

    socket.on('sendMessage', data => {
        io.to(data.room).emit('receiveMessage', data)
    })
    
    socket.on('emoSend', data => {
        io.to(data.room).emit('emoReceive', data)
    })

    socket.on('sendImage', data => {
        io.to(data.room).emit('receiveImage',data)
    })

})

function isEmptyObject(obj){  
    for(var key in obj){  
         return false
    }
    return true  
}
