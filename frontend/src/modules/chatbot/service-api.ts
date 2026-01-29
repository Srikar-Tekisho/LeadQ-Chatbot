export const chatService = {
    async sendMessage(message: string, sessionId: string | null, onChunk: (data: any) => void) {
        const response = await fetch('http://127.0.0.1:5002/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId
            }),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep the last partial line

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const data = JSON.parse(line);
                    onChunk(data);
                } catch (e) {
                    console.error("Error parsing stream chunk", e);
                }
            }
        }
    }
};
