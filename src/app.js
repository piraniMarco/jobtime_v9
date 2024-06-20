const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

// Ajustar os caminhos dos módulos
const Clientes = require('./models/clientes'); 
const Consultores = require('./models/consultores');
const Consultoria = require('./models/consultoria');
const Feedback = require('./models/feedback'); // Importar o modelo Feedback

const app = express();
const porta = process.env.PORT || 3001; 

// Configuração do body-parser para lidar com dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('login'); // Renderiza o arquivo login.ejs na pasta views
});

// Configuração do EJS
app.set('views', path.join(__dirname, 'views')); // Ajuste o caminho conforme necessário
app.set('view engine', 'ejs');

// Conexão com o banco de dados MySQL usando Sequelize
const sequelize = require('./config/database'); // Ajuste o caminho conforme necessário

// Sincronização dos modelos com o banco de dados
sequelize.sync({ alter: true }).then(() => {
    console.log('Tabelas sincronizadas');
}).catch((err) => {
    console.error('Erro ao sincronizar as tabelas:', err);
});

// Rota para lidar com a solicitação de salvar os dados no banco de dados - Clientes
app.post('/salvar-clientes', async (req, res) => {
    try {
        const { razaoSocial, nomeFantasia, cnpj, telefone, email } = req.body;

        const novoCliente = await Clientes.create({
            razaoSocial,
            nomeFantasia,
            cnpj,
            telefone,
            email
        });

        res.json({
            success: true,
            cliente: novoCliente
        });

    } catch (err) {
        console.error('Erro ao salvar cliente:', err);
        res.status(500).json({ success: false, message: 'Erro ao salvar cliente.' });
    }
});

// Configuração da sessão
app.use(session({
    secret: 'momento@170839', // Chave Secreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para produção, definir como true
}));

// Rota para renderizar página de login
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Função para validar as credenciais do usuário no banco de dados
async function validarCredenciais(username, password) {
    try {
        const consultor = await Consultores.findOne({ where: { login: username } });
        if (consultor && bcrypt.compareSync(password, consultor.senha)) {
            return true; // Credenciais válidas
        } else {
            return false; // Credenciais inválidas
        }
    } catch (err) {
        console.error('Erro ao verificar credenciais:', err);
        return false; // Erro ao processar as credenciais
    }
}

// Rota para lidar com os dados do formulário de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.render('login', { error: 'Por favor, preencha todos os campos.' });
    } else {
        try {
            const consultor = await Consultores.findOne({ where: { login: username } });
            if (consultor && await bcrypt.compare(password, consultor.senha)) {
                // Criação da sessão do consultor
                req.session.consultorId = consultor.id;
                // Redireciona para a página do menu
                res.redirect('/menu');
            } else {
                // Renderiza novamente a página de login com uma mensagem de erro
                res.render('login', { error: 'Credenciais inválidas.' });
            }
        } catch (err) {
            console.error('Erro ao verificar credenciais:', err);
            // Renderiza novamente a página de login com uma mensagem de erro
            res.render('login', { error: 'Erro ao processar o login.' });
        }
    }
});

// Rota para lidar com a solicitação de salvar os dados no banco de dados - Consultores
app.post('/salvar-consultores', async (req, res) => {
    try {
        const { nome, endereco, telefone, email, login, senha, admin } = req.body;

        // Criptografar a senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoConsultor = await Consultores.create({
            nome,
            endereco,
            telefone,
            email,
            login,
            senha: senhaCriptografada,
            admin
        });

        res.json({
            success: true,
            consultor: novoConsultor
        });
    } catch (err) {
        console.error('Erro ao salvar consultor:', err);
        res.status(500).json({ success: false });
    }
});

// Rota para lidar com a solicitação de salvar os dados no banco de dados - Consultoria
app.post('/salvar-consultoria', async (req, res) => {
    try {
        const { data, horaInicio, horaFim, intervalo, valorHora, clienteId, consultorId } = req.body;

        await Consultoria.create({
            data,
            horaInicio,
            horaFim,
            intervalo,
            valorHora,
            clienteId,
            consultorId
        });

        res.redirect('/consultoria/inserir?success=true');
    } catch (err) {
        console.error('Erro ao salvar consultoria:', err);
        res.status(500).send('Erro ao salvar consultoria.');
    }
});

// Rota para renderizar a página de pesquisa de consultoria
app.get(['/consultoria/pesquisar', '/pesquisar-consultoria'], async (req, res) => {
    try {
        const { consultorId, clienteId, dataInicial, dataFinal } = req.query;
        const whereClause = {};

        if (consultorId) {
            whereClause.consultorId = consultorId;
        }
        if (clienteId) {
            whereClause.clienteId = clienteId;
        }
        if (dataInicial && dataFinal) {
            whereClause.data = {
                [Op.between]: [new Date(dataInicial), new Date(dataFinal)]
            };
        }

        const consultorias = await Consultoria.findAll({
            where: whereClause,
            include: [Clientes, Consultores]
        });

        const totalHoras = consultorias.reduce((sum, consultoria) => sum + consultoria.totalHoras, 0);
        const totalValor = consultorias.reduce((sum, consultoria) => sum + consultoria.totalValor, 0);

        const consultores = await Consultores.findAll();
        const clientes = await Clientes.findAll();

        res.render('pesquisar_consultoria', {
            consultorias: consultorias,
            totalHoras: totalHoras,
            totalValor: totalValor,
            consultores: consultores,
            clientes: clientes
        });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
});

// Rota para lidar com a pesquisa de consultorias (filtragem)
app.get('/consultas/trabalhos', async (req, res) => {
    try {
        const { clienteId, consultorId, dataInicio, dataFim } = req.query;
        const whereClause = {};

        if (clienteId) {
            whereClause.clienteId = clienteId;
        }
        if (consultorId) {
            whereClause.consultorId = consultorId;
        }
        if (dataInicio && dataFim) {
            whereClause.data = {
                [Op.between]: [new Date(dataInicio), new Date(dataFim)]
            };
        }

        const consultorias = await Consultoria.findAll({
            where: whereClause,
            include: [Clientes, Consultores]
        });

        res.render('pesquisar_consultoria', {
            consultorias: consultorias,
            clientes: await Clientes.findAll(),
            consultores: await Consultores.findAll()
        });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
});


// Rota para renderização da página consultores.ejs com dados do banco de dados
app.get('/cadastro/consultores', async (req, res) => {
    try {
        const consultores = await Consultores.findAll();
        res.render('consultores', { data: consultores });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
});
// Rota para renderização da página consultoria.ejs com dados do banco de dados
app.get('/consultoria/inserir', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        const consultores = await Consultores.findAll();
        const consultorias = await Consultoria.findAll({
            include: [Clientes, Consultores]
        });

        // Mapeando a consultoria para incluir o totalValor
        const consultoriasComTotal = consultorias.map(item => ({
            ...item.toJSON(),
            totalValor: item.totalValor
        }));

        res.render('consultoria', {
            data: consultoriasComTotal,
            clientes: clientes,
            consultores: consultores
        });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
});

// Rota para renderizar a tela de pesquisa de consultores
app.get('/pesquisa/consultores', async (req, res) => {
    try {
        const consultores = await Consultores.findAll();
        res.render('pesquisa_consultores', { consultores: consultores });
    } catch (err) {
        console.error('Erro ao carregar pesquisa de consultores:', err);
        res.status(500).send('Erro ao carregar pesquisa de consultores.');
    }
});

// Rota para lidar com a pesquisa de consultores
app.post('/pesquisa/consultores', async (req, res) => {
    try {
        const { nome, endereco, telefone, email, login } = req.body;
        const whereClause = {};

        if (nome) whereClause.nome = { [Op.like]: `%${nome}%` };
        if (endereco) whereClause.endereco = { [Op.like]: `%${endereco}%` };
        if (telefone) whereClause.telefone = { [Op.like]: `%${telefone}%` };
        if (email) whereClause.email = { [Op.like]: `%${email}%` };
        if (login) whereClause.login = { [Op.like]: `%${login}%` };

        const consultores = await Consultores.findAll({ where: whereClause });
        res.render('pesquisa_consultores', { consultores: consultores });
    } catch (err) {
        console.error('Erro ao pesquisar consultores:', err);
        res.status(500).send('Erro ao pesquisar consultores.');
    }
});

// Rota para renderizar a tela de edição de consultor
app.get('/editar-consultor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const consultor = await Consultores.findByPk(id);
        if (consultor) {
            res.render('editar_consultor', { consultor: consultor });
        } else {
            res.status(404).send('Consultor não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao carregar dados do consultor:', err);
        res.status(500).send('Erro ao carregar dados do consultor.');
    }
});

// Rota para atualizar os dados do consultor
app.post('/editar-consultor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, endereco, telefone, email, login, senha, admin } = req.body;

        const consultor = await Consultores.findByPk(id);
        if (consultor) {
            consultor.nome = nome;
            consultor.endereco = endereco;
            consultor.telefone = telefone;
            consultor.email = email;
            consultor.login = login;
            if (senha) {
                consultor.senha = await bcrypt.hash(senha, 10);
            }
            consultor.admin = admin;

            await consultor.save();

            res.redirect('/pesquisa/consultores');
        } else {
            res.status(404).send('Consultor não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao atualizar dados do consultor:', err);
        res.status(500).send('Erro ao atualizar dados do consultor.');
    }
});

// Rota para deletar um consultor
app.post('/deletar-consultor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Verifica se o consultor está vinculado a alguma consultoria ou outro cadastro
        const consultoriasVinculadas = await Consultoria.findAll({ where: { consultorId: id } });
        if (consultoriasVinculadas.length > 0) {
            return res.status(400).json({ message: 'Consultor adicionado em algum cadastro. Desvincule e tente novamente!' });
        }
        await Consultores.destroy({ where: { id: id } });
        res.redirect('/pesquisa/consultores');
    } catch (err) {
        console.error('Erro ao deletar consultor:', err);
        res.status(500).send('Erro ao deletar consultor.');
    }
});

// Rota para renderizar a página de clientes
app.get('/cadastro/clientes', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        res.render('clientes', { data: clientes });
    } catch (err) {
        console.error('Erro ao consultar dados do banco de dados:', err);
        res.status(500).send('Erro ao consultar dados do banco de dados.');
    }
});

// Rotas para renderizar a tela de pesquisa de clientes
app.get('/pesquisa/clientes', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        res.render('pesquisa_clientes', { clientes: clientes });
    } catch (err) {
        console.error('Erro ao carregar pesquisa de clientes:', err);
        res.status(500).send('Erro ao carregar pesquisa de clientes.');
    }
});

// Rota para lidar com a pesquisa de clientes
app.post('/pesquisa/clientes', async (req, res) => {
    try {
        const { razaoSocial, nomeFantasia, cnpj, telefone, email } = req.body;
        const whereClause = {};

        if (razaoSocial) whereClause.razaoSocial = { [Op.like]: `%${razaoSocial}%` };
        if (nomeFantasia) whereClause.nomeFantasia = { [Op.like]: `%${nomeFantasia}%` };
        if (cnpj) whereClause.cnpj = { [Op.like]: `%${cnpj}%` };
        if (telefone) whereClause.telefone = { [Op.like]: `%${telefone}%` };
        if (email) whereClause.email = { [Op.like]: `%${email}%` };

        const clientes = await Clientes.findAll({ where: whereClause });
        res.render('pesquisa_clientes', { clientes: clientes });
    } catch (err) {
        console.error('Erro ao pesquisar clientes:', err);
        res.status(500).send('Erro ao pesquisar clientes.');
    }
});

// Rota para renderizar a tela de edição de clientes
app.get('/editar-cliente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Clientes.findByPk(id);
        if (cliente) {
            res.render('editar_cliente', { cliente: cliente });
        } else {
            res.status(404).send('Cliente não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao carregar dados do cliente:', err);
        res.status(500).send('Erro ao carregar dados do cliente.');
    }
});

// Rota para atualizar os dados do cliente
app.post('/editar-cliente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { razaoSocial, nomeFantasia, cnpj, telefone, email } = req.body;

        const cliente = await Clientes.findByPk(id);
        if (cliente) {
            cliente.razaoSocial = razaoSocial;
            cliente.nomeFantasia = nomeFantasia;
            cliente.cnpj = cnpj;
                cliente.telefone = telefone;
                cliente.email = email;

                await cliente.save();

                res.redirect('/pesquisa/clientes');
            } else {
                res.status(404).send('Cliente não encontrado.');
            }
        } catch (err) {
            console.error('Erro ao atualizar dados do cliente:', err);
            res.status(500).send('Erro ao atualizar dados do cliente.');
        }
    });

// Rota para deletar um cliente
app.post('/deletar-cliente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Clientes.destroy({ where: { id: id } });
        res.redirect('/pesquisa/clientes');
    } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        res.status(500).send('Erro ao deletar cliente.');
    }
});

// Rota para renderizar a página de cadastro de feedback
app.get('/feedback/cadastrar', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        const consultores = await Consultores.findAll(); // Obter a lista de consultores
        const success = req.query.success || false; // Adiciona a variável success
        res.render('cadastrar_feedback', { clientes: clientes, consultores: consultores, success: success });
    } catch (err) {
        console.error('Erro ao carregar página de cadastro de feedback:', err);
        res.status(500).send('Erro ao carregar página de cadastro de feedback.');
    }
});

// Rota para lidar com a solicitação de salvar o feedback no banco de dados
app.post('/feedback/cadastrar', async (req, res) => {
    try {
        const { titulo, data, clienteId, consultorId, texto } = req.body; // Adiciona consultorId

        const novoFeedback = await Feedback.create({
            titulo,
            data,
            clienteId,
            consultorId, // Inclui consultorId
            texto
        });

        res.redirect('/feedback/cadastrar?success=true');
    } catch (err) {
        console.error('Erro ao salvar feedback:', err);
        res.status(500).send('Erro ao salvar feedback.');
    }
});


// Rota para renderizar a página de pesquisa de feedback
app.get('/feedback/pesquisar', async (req, res) => {
    try {
        const clientes = await Clientes.findAll();
        const consultores = await Consultores.findAll();
        const { titulo, data, clienteId, consultorId } = req.query;
        const whereClause = {};

        if (titulo) whereClause.titulo = { [Op.like]: `%${titulo}%` };
        if (data) whereClause.data = data;
        if (clienteId) whereClause.clienteId = clienteId;
        if (consultorId) whereClause.consultorId = consultorId;

        const feedbacks = await Feedback.findAll({
            where: whereClause,
            include: [Clientes, Consultores]
        });
        res.render('pesquisar_feedback', { feedbacks: feedbacks, clientes: clientes, consultores: consultores });
    } catch (err) {
        console.error('Erro ao carregar página de pesquisa de feedback:', err);
        res.status(500).send('Erro ao carregar página de pesquisa de feedback.');
    }
});

// Rota para renderizar a tela de edição de feedback
app.get('/editar-feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByPk(id, {
            include: [Clientes, Consultores]
        });
        const clientes = await Clientes.findAll();
        const consultores = await Consultores.findAll();
        if (feedback) {
            res.render('editar_feedback', { feedback: feedback, clientes: clientes, consultores: consultores });
        } else {
            res.status(404).send('Feedback não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao carregar dados do feedback:', err);
        res.status(500).send('Erro ao carregar dados do feedback.');
    }
});

// Rota para atualizar os dados do feedback
app.post('/editar-feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, data, clienteId, consultorId, texto } = req.body;

        const feedback = await Feedback.findByPk(id);
        if (feedback) {
            feedback.titulo = titulo;
            feedback.data = data;
            feedback.clienteId = clienteId;
            feedback.consultorId = consultorId;
            feedback.texto = texto;

            await feedback.save();

            res.redirect('/feedback/pesquisar');
        } else {
            res.status(404).send('Feedback não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao atualizar dados do feedback:', err);
        res.status(500).send('Erro ao atualizar dados do feedback.');
    }
});

// Rota para deletar um feedback
app.post('/deletar-feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Feedback.destroy({ where: { id: id } });
        res.redirect('/feedback/pesquisar');
    } catch (err) {
        console.error('Erro ao deletar feedback:', err);
        res.status(500).send('Erro ao deletar feedback.');
    }
});

// Rota para renderizar a tela de edição de consultoria
app.get('/editar-consultoria/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const consultoria = await Consultoria.findByPk(id, {
            include: [Clientes, Consultores]
        });
        const clientes = await Clientes.findAll();
        const consultores = await Consultores.findAll();
        if (consultoria) {
            res.render('editar_consultoria', { consultoria: consultoria, clientes: clientes, consultores: consultores });
        } else {
            res.status(404).send('Consultoria não encontrada.');
        }
    } catch (err) {
        console.error('Erro ao carregar dados da consultoria:', err);
        res.status(500).send('Erro ao carregar dados da consultoria.');
    }
});

// Rota para atualizar os dados da consultoria
app.post('/editar-consultoria/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, horaInicio, horaFim, intervalo, valorHora, clienteId, consultorId } = req.body;

        const consultoria = await Consultoria.findByPk(id);
        if (consultoria) {
            consultoria.data = data;
            consultoria.horaInicio = horaInicio;
            consultoria.horaFim = horaFim;
            consultoria.intervalo = intervalo;
            consultoria.valorHora = valorHora;
            consultoria.clienteId = clienteId;
            consultoria.consultorId = consultorId;

            await consultoria.save();

            res.redirect('/consultoria/inserir?success=true');
        } else {
            res.status(404).send('Consultoria não encontrada.');
        }
    } catch (err) {
        console.error('Erro ao atualizar dados da consultoria:', err);
        res.status(500).send('Erro ao atualizar dados da consultoria.');
    }
});

// Rota para deletar uma consultoria
app.post('/deletar-consultoria/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Consultoria.destroy({ where: { id: id } });
        res.redirect('/consultoria/inserir');
    } catch (err) {
        console.error('Erro ao deletar consultoria:', err);
        res.status(500).send('Erro ao deletar consultoria.');
    }
});


// Rota para a página do menu principal
app.get('/menu', (req, res) => {
    res.render('menu');
});

// Adicione a rota para o caminho raiz para renderizar o menu.ejs
app.get('/', (req, res) => {
    res.render('login');
});

// Inicialização do servidor
app.listen(porta, () => {
    console.log(`Servidor iniciado em http://localhost:${porta}`);
});
