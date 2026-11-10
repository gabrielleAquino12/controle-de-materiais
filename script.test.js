/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Sistema Controle de Materiais", () => {

    beforeEach(async () => {
        localStorage.clear();

        document.body.innerHTML = `
            <section id="inicio" class="tela"></section>
            <section id="cadastro" class="tela"></section>
            <section id="estoque" class="tela"></section>
            <section id="movimentacao" class="tela"></section>

            <span id="total"></span>
            <span id="unidades"></span>
            <span id="baixo"></span>

            <form id="formCadastro">
                <input id="nome">
                <input id="categoria">
                <input id="quantidade">
                <input id="minimo">
            </form>

            <form id="formMovimentacao">
                <select id="material"></select>
                <select id="tipo">
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>
                <input id="qtdMovimentacao">
            </form>

            <input id="busca">
            <table><tbody id="listaEstoque"></tbody></table>
            <div id="vazio"></div>
            <div id="historico"></div>
        `;

        vi.stubGlobal("alert", vi.fn());

        vi.resetModules();
        await import("./script.js");
    });

    it("deve cadastrar um material", () => {
        document.getElementById("nome").value = "Papel A4";
        document.getElementById("categoria").value = "Escritório";
        document.getElementById("quantidade").value = "20";
        document.getElementById("minimo").value = "5";

        document.getElementById("formCadastro")
            .dispatchEvent(new Event("submit", {
                bubbles: true,
                cancelable: true
            }));

        const materiais = JSON.parse(localStorage.getItem("materiais"));

        expect(materiais).toHaveLength(1);
        expect(materiais[0].nome).toBe("Papel A4");
    });

    it("deve impedir o cadastro de material duplicado", () => {
        localStorage.setItem("materiais", JSON.stringify([
            { id: 1, nome: "Papel A4", categoria: "Escritório",
              quantidade: 20, minimo: 5 }
        ]));

        vi.resetModules();

        return import("./script.js").then(() => {
            document.getElementById("nome").value = "Papel A4";
            document.getElementById("categoria").value = "Escritório";
            document.getElementById("quantidade").value = "10";
            document.getElementById("minimo").value = "2";

            document.getElementById("formCadastro")
                .dispatchEvent(new Event("submit", {
                    bubbles: true,
                    cancelable: true
                }));

            expect(JSON.parse(localStorage.getItem("materiais")))
                .toHaveLength(1);
        });
    });

    it("deve atualizar o estoque após uma entrada", () => {
        localStorage.setItem("materiais", JSON.stringify([
            { id: 1, nome: "Papel A4", categoria: "Escritório",
              quantidade: 10, minimo: 5 }
        ]));

        vi.resetModules();

        return import("./script.js").then(() => {
            document.getElementById("material").value = "1";
            document.getElementById("tipo").value = "entrada";
            document.getElementById("qtdMovimentacao").value = "5";

            document.getElementById("formMovimentacao")
                .dispatchEvent(new Event("submit", {
                    bubbles: true,
                    cancelable: true
                }));

            const materiais = JSON.parse(localStorage.getItem("materiais"));
            expect(materiais[0].quantidade).toBe(15);
        });
    });

    it("deve impedir uma saída maior que o estoque", () => {
        localStorage.setItem("materiais", JSON.stringify([
            { id: 1, nome: "Papel A4", categoria: "Escritório",
              quantidade: 10, minimo: 5 }
        ]));

        vi.resetModules();

        return import("./script.js").then(() => {
            document.getElementById("material").value = "1";
            document.getElementById("tipo").value = "saida";
            document.getElementById("qtdMovimentacao").value = "20";

            document.getElementById("formMovimentacao")
                .dispatchEvent(new Event("submit", {
                    bubbles: true,
                    cancelable: true
                }));

            const materiais = JSON.parse(localStorage.getItem("materiais"));
            expect(materiais[0].quantidade).toBe(10);
        });
    });

    it("deve registrar a movimentação no histórico", () => {
        localStorage.setItem("materiais", JSON.stringify([
            { id: 1, nome: "Papel A4", categoria: "Escritório",
              quantidade: 10, minimo: 5 }
        ]));

        vi.resetModules();

        return import("./script.js").then(() => {
            document.getElementById("material").value = "1";
            document.getElementById("tipo").value = "entrada";
            document.getElementById("qtdMovimentacao").value = "3";

            document.getElementById("formMovimentacao")
                .dispatchEvent(new Event("submit", {
                    bubbles: true,
                    cancelable: true
                }));

            const historico = JSON.parse(localStorage.getItem("historico"));
            expect(historico).toHaveLength(1);
            expect(historico[0].material).toBe("Papel A4");
        });
    });

});