// source: http://mathhelpplanet.com/static.php?p=javascript-operatsii-nad-matritsami

/**
 * Транспонирование матрицы
 *
 * @param A матрица (двумерный массив)
 * @returns {Array}
 */
function TransMatrix(A) {
    var m = A.length, n = A[0].length, AT = [];
    for (var i = 0; i < n; i++) {
        AT[i] = [];
        for (var j = 0; j < m; j++) AT[i][j] = A[j][i];
    }
    return AT;
}

/**
 * Сложение матриц
 *
 * На входе двумерные массивы одинаковой размерности
 *
 * @param A матрица (двумерный массив)
 * @param B матрица (двумерный массив)
 * @returns {Array}
 */
function SumMatrix(A, B)
{
    var m = A.length, n = A[0].length, C = [];
    for (var i = 0; i < m; i++) {
        C[i] = [];
        for (var j = 0; j < n; j++) C[i][j] = A[i][j] + B[i][j];
    }
    return C;
}

/**
 * Умножение матрицы на число
 *
 * @param a число
 * @param A матрица (двумерный массив)
 * @returns {Array}
 */
function multMatrixNumber(a, A) {
    var m = A.length, n = A[0].length, B = [];
    for (var i = 0; i < m; i++) {
        B[i] = [];
        for (var j = 0; j < n; j++) B[i][j] = a * A[i][j];
    }
    return B;
}

/**
 * Умножение матриц
 *
 * @param A
 * @param B
 * @returns {*}
 */
function MultiplyMatrix(A, B) {
    var rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];
    if (colsA != rowsB) return false;
    for (var i = 0; i < rowsA; i++) C[i] = [];
    for (var k = 0; k < colsB; k++) {
        for (var i = 0; i < rowsA; i++) {
            var t = 0;
            for (var j = 0; j < rowsB; j++) t += A[i][j] * B[j][k];
            C[i][k] = t;
        }
    }
    return C;
}

/**
 * Возведение матрицы в степень
 *
 * @param n степерь
 * @param A матрица (двумерный массив)
 * @returns {*}
 */
function MatrixPow(n, A) {
    if (n == 1) return A;
    else return MultiplyMatrix(A, MatrixPow(n - 1, A));
}

/**
 * Определитель матрицы
 *
 * Используется алгоритм Барейса, сложность O(n^3)
 *
 * @param A матрица (двумерный массив)
 * @returns {*}
 */
function Determinant(A)
{
    var N = A.length, B = [], denom = 1, exchanges = 0;
    for (var i = 0; i < N; ++i) {
        B[i] = [];
        for (var j = 0; j < N; ++j) B[i][j] = A[i][j];
    }
    for (var i = 0; i < N - 1; ++i) {
        var maxN = i, maxValue = Math.abs(B[i][i]);
        for (var j = i + 1; j < N; ++j) {
            var value = Math.abs(B[j][i]);
            if (value > maxValue) {
                maxN = j;
                maxValue = value;
            }
        }
        if (maxN > i) {
            var temp = B[i];
            B[i] = B[maxN];
            B[maxN] = temp;
            ++exchanges;
        }
        else {
            if (maxValue == 0) return maxValue;
        }
        var value1 = B[i][i];
        for (var j = i + 1; j < N; ++j) {
            var value2 = B[j][i];
            B[j][i] = 0;
            for (var k = i + 1; k < N; ++k) B[j][k] = (B[j][k] * value1 - B[i][k] * value2) / denom;
        }
        denom = value1;
    }
    if (exchanges % 2) return -B[N - 1][N - 1];
    else return B[N - 1][N - 1];
}

/**
 * Ранг матрицы
 *
 * @param A матрица (двумерный массив)
 * @returns {number}
 */
function MatrixRank(A) {
    var m = A.length, n = A[0].length, k = (m < n ? m : n), r = 1, rank = 0;
    while (r <= k) {
        var B = [];
        for (var i = 0; i < r; i++) B[i] = [];
        for (var a = 0; a < m - r + 1; a++) {
            for (var b = 0; b < n - r + 1; b++) {
                for (var c = 0; c < r; c++) {
                    for (var d = 0; d < r; d++) B[c][d] = A[a + c][b + d];
                }
                if (Determinant(B) != 0) rank = r;
            }
        }
        r++;
    }
    return rank;
}

/**
 * Союзная матрица
 *
 * @param A двумерный квадратный массив
 * @returns {Array}
 */
function AdjugateMatrix(A)
{
    var N = A.length, adjA = [];
    for (var i = 0; i < N; i++) {
        adjA[i] = [];
        for (var j = 0; j < N; j++) {
            var B = [], sign = ((i + j) % 2 == 0) ? 1 : -1;
            for (var m = 0; m < j; m++) {
                B[m] = [];
                for (var n = 0; n < i; n++)   B[m][n] = A[m][n];
                for (var n = i + 1; n < N; n++) B[m][n - 1] = A[m][n];
            }
            for (var m = j + 1; m < N; m++) {
                B[m - 1] = [];
                for (var n = 0; n < i; n++)   B[m - 1][n] = A[m][n];
                for (var n = i + 1; n < N; n++) B[m - 1][n - 1] = A[m][n];
            }
            adjA[i][j] = sign * Determinant(B);
        }
    }
    return adjA;
}

/**
 * Обратная матрица
 *
 * @param A двумерный квадратный массив
 * @returns {*}
 */
function InverseMatrix(A)
{
    var det = Determinant(A);
    if (det == 0) return false;
    var N = A.length, A = AdjugateMatrix(A);
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) A[i][j] /= det;
    }
    return A;
}



function InverseMatrixGauss(A) {
    var I, n, v,
        i, j, k,
        useMatrix = false;

    if (A instanceof math.type.Matrix) {
        A = A.toArray();
        useMatrix = true;
    }

    n = A.length;
    I = [];
    for (i = 0; i < n; i++) {
        I[i] = [];
        for (j = 0; j < n; j++) {
            I[i][j] = (i == j ? 1 : 0);
        }
    }

    for (k = 0; k < n; k++) {
        if (k == n - 1) console.log((A[k][k]).toFixed(6), A[k][k] == 0);
        v = A[k][k];
        for (j = 0; j < n; j++) {
            if (_calcHelper(v) == 0) continue;
            I[k][j] = _calcHelper(I[k][j] / v);
            A[k][j] = _calcHelper(A[k][j] / v);
        }
        for (i = k + 1; i < n; i++) {
            v = A[i][k];
            for (j = 0; j < n; j++) {
                I[i][j] = I[i][j] - I[k][j] * v;
                A[i][j] = A[i][j] - A[k][j] * v;
            }
        }
    }

    for (k = n - 1; k > 0; k--) {
        for (i = 0; i < k; i++) {
            v = A[i][k];
            for (j = 0; j < n; j++) {
                I[i][j] = _calcHelper(I[i][j] - I[k][j] * v);
                A[i][j] = _calcHelper(A[i][j] - A[k][j] * v);
            }
        }
    }

    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            I[i][j] = _calcHelper(I[i][j] - 0);
        }
    }

    console.log(I, A);
    return useMatrix ? math.matrix(I) : I;
}

function DivideMatrix(A, B) {
    var useMatrix = false,
        length, i,
        result = [];

    if (A instanceof math.type.Matrix) {
        A = A.toArray();
        useMatrix = true;
    }
    if (B instanceof math.type.Matrix) {
        B = B.toArray();
        useMatrix = true;
    }
    if (A.length != B.length) {
        return false;
    }

    length = A.length;
    for (i = 0; i < length; i++) {
        if (A[i] instanceof math.type.Complex || B[i] instanceof math.type.Complex) {
            result[i] = (B[i] instanceof math.type.Complex ? B[i].toPolar().r : B[i]) == 0 ? 0 : math.divide(A[i], B[i]);
        } else {
            result[i] = B[i] == 0 ? 0 : A[i] / B[i];
        }
    }

    return useMatrix ? math.matrix(result) : result;
}

function complexValue(value) {
    if (value instanceof math.type.Complex) {
        return value.toPolar().r;
    } else {
        return value;
    }
}

function _calcHelper(value) {
    if (value.toFixed(6) == value.toFixed(0) + '.000000') {
        return parseInt(value.toFixed(0));
    } else if (value.toFixed(6) == '-0.000000') {
        return 0;
    } else {
        return value;
    }
}
