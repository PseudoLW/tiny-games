import { render } from "preact";
import { useEffect, useState } from 'preact/hooks';

const ServerFetcher = () => {
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('./api');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMessage(data.message);
            } catch (error) {
                setMessage(`ERROR: ${error.message}`);
            } finally {
                setLoaded(true);
            }
        })();
    }, []);
    return loaded ? <p>{message}</p> : <p>Loading...</p>;
};
const App = () => {
    const [fetched, setFetched] = useState(false);
    const onButtonClick = () => setFetched(true);
    return <>
        <h1>Hello from the client!</h1>
        {!fetched ? <button onClick={onButtonClick}>Call the server!</button> : <ServerFetcher />}
    </>;
};

render(<App />, document.body);