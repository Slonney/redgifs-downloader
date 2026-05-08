export default async function handler(req, res) {
    // Permite qualquer origem (resolve o CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID não fornecido' });
    }

    try {
        // 1. Pega token temporário da API do Redgifs
        const tokenRes = await fetch('https://api.redgifs.com/v2/auth/temporary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!tokenRes.ok) throw new Error('Falha ao obter token');
        const { token } = await tokenRes.json();

        // 2. Busca os dados do GIF com o token
        const gifRes = await fetch(`https://api.redgifs.com/v2/gifs/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!gifRes.ok) throw new Error('GIF não encontrado');
        const data = await gifRes.json();

        const urls = data.gif?.urls || {};

        if (!urls.hd && !urls.sd && !urls.gif) {
            return res.status(404).json({ error: 'Nenhuma URL encontrada' });
        }

        return res.status(200).json({
            hd:  urls.hd  || null,
            sd:  urls.sd  || null,
            gif: urls.gif || null,
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
