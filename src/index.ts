import express from 'express'
import MysqlErrorHandle from './mysql_error_handle.js'
import connection from './mysql_connection_handle.js'
import type { RowDataPacket } from 'mysql2'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

interface IQuantidadePedido extends RowDataPacket {
    quantidade_pedidos: number
}

app.get("/valor_pedido_total", async (req, res) => {
    try {
        const [resultado, campos] =
            await connection.execute(`select c.nome, SUM(ip.quantidade * prod.preco) 
                AS valor_total FROM clientes c JOIN pedidos p ON c.idclientes = p.clientes_idclientes
                 JOIN itenspedidos ip ON p.idpedidos = ip.pedidos_idpedidos JOIN produtos prod 
                 ON ip.produtos_idprodutos = prod.idprodutos GROUP BY p.idpedidos, c.nome`)
        console.log(resultado)
        res.status(200).json(resultado)
    } catch (err) {
        const mysqlErrorHandle = new MysqlErrorHandle(err, res)
        mysqlErrorHandle.validar()
    }
})

    
app.post("/cadastro_produto_v2", async (req, res) => {
    try {
        const {id, nome, categoria, preco} = req.body;
        const data_criacao = new Date();
        const data_modificacao = null;
        const sql = `
            INSERT INTO produto (id, nome, categoria, preco, data_criacao, data_modificacao) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [resultado] = await connection.execute(sql, [
            id, 
            nome, 
            categoria, 
            preco, 
            data_criacao, 
            data_modificacao
        ]);

        console.log(resultado)
        res.status(201).json(resultado)
    } catch (err) {
        const mysqlErrorHandle = new MysqlErrorHandle(err, res)
        mysqlErrorHandle.validar()
    }
})

app.listen(8000, () => {
    console.log("Servidor iniciado na porta 8000")
})