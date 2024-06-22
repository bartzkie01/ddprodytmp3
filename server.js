    const express = require('express');
    const app = express();
    const port = 3000;

    app.use(express.static('public'));
    app.use(express.json());

    const rapidApiKey = '84a87b9340msh192a0dac075160ap10507bjsne5c28566a873';
    const rapidApiHost = 'youtube-mp3-downloader2.p.rapidapi.com';

    app.post('/convert', async (req, res) => {
        const { url } = req.body;
        const apiUrl = `https://${rapidApiHost}/ytmp3/ytmp3/?url=${encodeURIComponent(url)}`;

        try {
            // Dynamic import of node-fetch as a CommonJS module
            const fetch = await import('node-fetch').then(module => module.default);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': rapidApiKey,
                    'x-rapidapi-host': rapidApiHost
                }
            });

            const contentType = response.headers.get('content-type');
            const responseData = await response.json();

            // Check if the response is HTML indicating access restrictions
            if (contentType && contentType.includes('text/html')) {
                console.error('API Access Error:', responseData);
                return res.json({ success: false, error: 'API Access Error', details: responseData });
            }

            if (responseData && responseData.dlink) {
                res.json({ success: true, downloadUrl: responseData.dlink });
            } else {
                console.error('Conversion failed:', responseData);
                res.json({ success: false, error: 'Conversion failed', details: responseData });
            }
        } catch (error) {
            console.error('Error:', error);
            res.json({ success: false, error: 'An error occurred', details: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    app.use((req, res, next) => {
        res.status(404).send('Sorry, can’t find that!');
    });

    function getYouTubeVideoId(url) {
        const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }
