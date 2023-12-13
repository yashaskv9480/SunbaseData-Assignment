const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');


const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src')));
app.use(express.json());
app.use(cookieParser()); 
app.use(cors())


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'src', 'loginpage.html'));
});

app.post('/api/login', async (req, res) => {
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp';
    const { login_id, password } = req.body; 

    try {
        const response = await axios.post(apiUrl, { login_id, password });
        if (response.status === 200) {
            delete response.data.carData;
            const authToken = response.data.access_token;
            res.cookie("authToken",authToken)
            console.log(req.cookies)
            res.status(200).json(response.data);
            
        } else {
            res.status(response.status).json({ error: 'Unexpected response status' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/customerdetails', async (req, res) => {
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list';
    console.log(req.cookies)
    const authToken = req.cookies.authToken; 
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
                });
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
            console.log(error)
        }
    }
});

app.post('/api/createcustomer', async (req, res) => {
    const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create';

    const {
        first_name,
        last_name,
        street,
        address,
        city,
        state,
        email,
        phone
    } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First Name or Last Name is missing' });
    }

    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        const response = await axios.post(apiUrl, {
            first_name,
            last_name,
            street,
            address,
            city,
            state,
            email,
            phone
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
            console.error(error);
        }
    }
});


app.post('/api/deletecustomer', async (req, res) => {
    const { uuid } = req.body;
    console.log(uuid)
    const apiUrl = `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete&uuid=${uuid}`;
    
    if (!uuid) {
        return res.status(400).json({ error: 'UUID is required for deletion' });
    }

    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        const response = await axios.post(apiUrl, null, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            res.status(200).json({ message: 'Successfully deleted' });
        } else {
            res.status(response.status).json({ error: 'Error Not deleted' });
        }
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
            console.log(error);
        }
    }
});

app.post('/api/updatecustomer', async (req, res) => {
    const {uuid} = req.body 
    const apiUrl = `https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=update&uuid=${uuid}`;

    const {
        first_name,
        last_name,
        street,
        address,
        city,
        state,
        email,
        phone
    } = req.body;

    if (!uuid) {
        return res.status(400).json({ error: 'UUID is required for updating a customer' });
    }

    if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First Name or Last Name is missing' });
    }

    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        const response = await axios.post(apiUrl, {
            first_name,
            last_name,
            street,
            address,
            city,
            state,
            email,
            phone
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            res.status(200).json({ message: 'Successfully updated' });
        } else {
            res.status(response.status).json({ error: 'Error during update' });
        }
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
            console.error(error);
        }
    }
});


app.get('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    console.log(req.cookies)
    res.status(200).json({ message: 'Logout successful' });
});


app.listen(PORT, () => {
    
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
