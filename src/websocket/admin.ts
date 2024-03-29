import { io } from "../http"
import { ConnectionsService } from "../services/ConnectionsService"
import { MessagesService } from "../services/MessagesService"


function init() {
    io.on("connect", async socket => {
        const connectionsService = new ConnectionsService()
        const messagesService = new MessagesService()

        const allConnectios = await connectionsService.findAll()

        io.emit("admin_list_all_users", allConnectios)

        socket.on("admin_list_messages_by_user", async (params, callback) => {
            const { user_id } = params;

            const allMessages = await messagesService.listByUser(user_id)
            callback(allMessages)
        })

        socket.on("admin_send_message", async params => {
            const { user_id, text } = params;
            messagesService.create({
                text,
                user_id,
                admin_id: socket.id
            })

            const { socket_id } = await connectionsService.findByUserId(user_id)
            
            io.to(socket_id).emit("admin_send_to_client", {
                text,
                socket_id_admin: socket.id
            })
        })

        socket.on("admin_user_in_support", async params => {
            const { user_id } = params;
            await connectionsService.updateAdminID(user_id, socket.id)

            // const allConnectiosWithoutAdmin = await connectionsService.findAllWithoutAdmin()

            // io.emit("admin_list_all_users", allConnectiosWithoutAdmin)
        })
    })
}

export { init }
