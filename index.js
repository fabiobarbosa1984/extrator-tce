(function () {
    'use strict';
    var request = require('request');
    var fs = require('fs');
    var os = require("os");
    const Entities = require('html-entities').XmlEntities;
    const entities = new Entities();


    var pegarValorTd = function (str) {
        return str.substring(str.indexOf('>') + 1, str.lastIndexOf('<'));

    };

    var pegarDados = function (endPoint, arquivoDestino) {
        request.post({
            url: endPoint,
            form: {
                exercicio: '2014'
            }
        }, function (err, httpResponse, body) {
            if (!err && httpResponse.statusCode === 200) {

                //transforma a resposta em uma array
                var arrLinhas = body.split('\n');

                //flag que está na seção de dados
                var blocoDados = false;

                //estrutura JSON com o resultado
                var result = [];

                //variavel de controle da posição do for dentro da estrutura
                var controle = -1;
                var linha = {};
                var conteudoArquivo = '';


                //loop que percorre todas as linhas da resposta
                for (var x = 0; x < arrLinhas.length; x++) {

                    if (arrLinhas[x].trim() === '<tbody>') {
                        //identifica que começou a estrutura de dados 
                        blocoDados = true;

                    } else if (arrLinhas[x].trim() === '</tbody>') {
                        //identifica que acabou a estrutura de dados
                        blocoDados = false;

                    } else {
                        //só processa caso esteja no bloco de dados
                        if (blocoDados) {

                            if (arrLinhas[x].trim() === '<tr class="">') {
                                //identifica que começou um novo registro
                                controle = 0;
                                //linha = {};                                
                            }

                            if (arrLinhas[x].trim() === '</tr>') {
                                //identifica que acabou o registro
                                controle = -1;
                                //  result.push(linha);
                            }

                            if (arrLinhas[x].indexOf('<td>') > -1 && controle >= 0) {
                                //recupera os valores
                                if (controle == 0) {
                                    //    linha.municipio = pegarValorTd(arrLinhas[x]);
                                    conteudoArquivo = conteudoArquivo + entities.decode(pegarValorTd(arrLinhas[x])) + ';';
                                    controle = controle + 1;
                                } else if (controle == 1) {
                                    //    linha.valor = pegarValorTd(arrLinhas[x]);
                                    conteudoArquivo = conteudoArquivo + pegarValorTd(arrLinhas[x]).replace('.', '').replace('.', '').replace('.', '').replace('R$', '').trim() + os.EOL;
                                    controle = controle + 1;
                                }
                            }
                        } //fim do tratamento do bloco de dados
                    }
                } //fim do loop 


                //escreve no arquivo de destino no formato

                fs.appendFile(arquivoDestino, conteudoArquivo);
            }
        });

    };

    pegarDados('http://fiscalizandocomtce.tce.mg.gov.br/Indices/_RankEducacao', 'educacao.csv');
    pegarDados('http://fiscalizandocomtce.tce.mg.gov.br/Indices/_RankSaude', 'saude.csv');

}())
